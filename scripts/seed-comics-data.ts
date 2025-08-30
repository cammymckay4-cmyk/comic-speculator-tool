#!/usr/bin/env tsx

/**
 * Comic Catalog Database Seeding Script
 * 
 * This script connects to an external Comic Catalog Database (GCD format)
 * and populates the application's comic_series and comic_issues tables
 * with Marvel and DC Comics data.
 * 
 * Usage:
 *   npm run seed:comics
 *   or
 *   tsx scripts/seed-comics-data.ts
 * 
 * Required Environment Variables:
 *   - SUPABASE_URL: Your Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin operations
 *   - GCD_DATABASE_URL: Connection string for the external GCD database
 *     Format: mysql://user:password@host:port/database
 * 
 * Optional Environment Variables:
 *   - BATCH_SIZE: Number of records to process in each batch (default: 100)
 *   - MAX_SERIES: Maximum number of series to process (default: unlimited)
 *   - MAX_ISSUES: Maximum number of issues to process per series (default: unlimited)
 *   - DRY_RUN: Set to 'true' to preview changes without writing to database
 */

import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

// Load environment variables
config();

interface GCDSeries {
  id: number;
  name: string;
  sort_name: string;
  publisher_id: number;
  country_id: number;
  language_id: number;
  year_began: number;
  year_ended: number | null;
  publication_dates: string;
  first_issue_id: number | null;
  last_issue_id: number | null;
  issue_count: number;
  created: Date;
  modified: Date;
  deleted: boolean;
}

interface GCDIssue {
  id: number;
  series_id: number;
  number: string;
  title: string;
  no_title: boolean;
  volume: string | null;
  display_volume_with_number: boolean;
  publication_date: string;
  key_date: string;
  sort_code: number;
  price: string;
  page_count: number | null;
  page_count_uncertain: boolean;
  created: Date;
  modified: Date;
  deleted: boolean;
}

interface GCDPublisher {
  id: number;
  name: string;
  country_id: number;
  year_began: number;
  year_ended: number | null;
  url: string;
  notes: string;
  created: Date;
  modified: Date;
  deleted: boolean;
}

interface ProcessingStats {
  seriesProcessed: number;
  seriesSkipped: number;
  issuesProcessed: number;
  issuesSkipped: number;
  errors: string[];
  startTime: Date;
  endTime?: Date;
}

class ComicDataSeeder {
  private supabase;
  private gcdDb;
  private stats: ProcessingStats;
  private config: {
    batchSize: number;
    maxSeries: number | null;
    maxIssues: number | null;
    dryRun: boolean;
  };

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Initialize GCD database connection
    const gcdUrl = process.env.GCD_DATABASE_URL;
    if (!gcdUrl) {
      throw new Error('Missing GCD_DATABASE_URL environment variable. Format: mysql://user:password@host:port/database');
    }

    this.gcdDb = mysql.createConnection(gcdUrl);

    // Initialize configuration
    this.config = {
      batchSize: parseInt(process.env.BATCH_SIZE || '100'),
      maxSeries: process.env.MAX_SERIES ? parseInt(process.env.MAX_SERIES) : null,
      maxIssues: process.env.MAX_ISSUES ? parseInt(process.env.MAX_ISSUES) : null,
      dryRun: process.env.DRY_RUN === 'true'
    };

    // Initialize processing stats
    this.stats = {
      seriesProcessed: 0,
      seriesSkipped: 0,
      issuesProcessed: 0,
      issuesSkipped: 0,
      errors: [],
      startTime: new Date()
    };
  }

  async connect(): Promise<void> {
    try {
      console.log('🔌 Connecting to databases...');
      
      // Test Supabase connection
      const { error } = await this.supabase.from('comic_series').select('count').limit(1);
      if (error) {
        throw new Error(`Supabase connection failed: ${error.message}`);
      }

      // Test GCD database connection
      await this.gcdDb.execute('SELECT 1');
      
      console.log('✅ Database connections established');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async getPublishers(): Promise<GCDPublisher[]> {
    console.log('📚 Fetching publishers (Marvel & DC)...');
    
    const query = `
      SELECT id, name, country_id, year_began, year_ended, url, notes, created, modified, deleted
      FROM gcd_publisher 
      WHERE name IN ('Marvel Comics', 'DC Comics') 
      AND deleted = 0
      ORDER BY name
    `;

    const [rows] = await this.gcdDb.execute(query);
    const publishers = rows as GCDPublisher[];
    
    console.log(`✅ Found ${publishers.length} publishers`);
    return publishers;
  }

  async getSeriesForPublisher(publisherId: number, publisherName: string): Promise<GCDSeries[]> {
    console.log(`📖 Fetching series for ${publisherName}...`);

    let query = `
      SELECT id, name, sort_name, publisher_id, country_id, language_id, 
             year_began, year_ended, publication_dates, first_issue_id, 
             last_issue_id, issue_count, created, modified, deleted
      FROM gcd_series 
      WHERE publisher_id = ? AND deleted = 0
      ORDER BY year_began DESC, name ASC
    `;

    const params: any[] = [publisherId];

    if (this.config.maxSeries) {
      query += ' LIMIT ?';
      params.push(this.config.maxSeries);
    }

    const [rows] = await this.gcdDb.execute(query, params);
    const series = rows as GCDSeries[];
    
    console.log(`✅ Found ${series.length} series for ${publisherName}`);
    return series;
  }

  async getIssuesForSeries(seriesId: number, seriesName: string): Promise<GCDIssue[]> {
    let query = `
      SELECT id, series_id, number, title, no_title, volume, 
             display_volume_with_number, publication_date, key_date, 
             sort_code, price, page_count, page_count_uncertain,
             created, modified, deleted
      FROM gcd_issue 
      WHERE series_id = ? AND deleted = 0
      ORDER BY sort_code ASC, number ASC
    `;

    const params: any[] = [seriesId];

    if (this.config.maxIssues) {
      query += ' LIMIT ?';
      params.push(this.config.maxIssues);
    }

    const [rows] = await this.gcdDb.execute(query, params);
    const issues = rows as GCDIssue[];
    
    return issues;
  }

  private parsePublicationDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    // Handle various date formats from GCD
    const cleanDate = dateStr.trim();
    
    // Try parsing YYYY-MM-DD format first
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      return new Date(cleanDate);
    }
    
    // Try parsing YYYY-MM format
    if (/^\d{4}-\d{2}$/.test(cleanDate)) {
      return new Date(cleanDate + '-01');
    }
    
    // Try parsing just YYYY format
    if (/^\d{4}$/.test(cleanDate)) {
      return new Date(cleanDate + '-01-01');
    }
    
    return null;
  }

  async upsertSeries(gcdSeries: GCDSeries, publisherName: string): Promise<string | null> {
    try {
      const seriesData = {
        name: gcdSeries.name,
        aliases: gcdSeries.sort_name !== gcdSeries.name ? [gcdSeries.sort_name] : [],
        publisher: publisherName,
        publication_start_date: gcdSeries.year_began ? new Date(gcdSeries.year_began, 0, 1).toISOString().split('T')[0] : null,
        publication_end_date: gcdSeries.year_ended ? new Date(gcdSeries.year_ended, 11, 31).toISOString().split('T')[0] : null,
        description: `${publisherName} series with ${gcdSeries.issue_count} issues. Publication dates: ${gcdSeries.publication_dates || 'Unknown'}`
      };

      if (this.config.dryRun) {
        console.log('  📝 [DRY RUN] Would upsert series:', gcdSeries.name);
        return 'dry-run-id';
      }

      // Check if series already exists
      const { data: existingSeries, error: selectError } = await this.supabase
        .from('comic_series')
        .select('id')
        .eq('name', gcdSeries.name)
        .eq('publisher', publisherName)
        .maybeSingle();

      if (selectError) {
        throw selectError;
      }

      if (existingSeries) {
        // Update existing series
        const { error: updateError } = await this.supabase
          .from('comic_series')
          .update(seriesData)
          .eq('id', existingSeries.id);

        if (updateError) throw updateError;
        return existingSeries.id;
      } else {
        // Insert new series
        const { data, error: insertError } = await this.supabase
          .from('comic_series')
          .insert(seriesData)
          .select('id')
          .single();

        if (insertError) throw insertError;
        return data.id;
      }
    } catch (error) {
      const errorMsg = `Failed to upsert series ${gcdSeries.name}: ${error}`;
      this.stats.errors.push(errorMsg);
      console.error('  ❌', errorMsg);
      return null;
    }
  }

  async upsertIssue(gcdIssue: GCDIssue, seriesId: string): Promise<boolean> {
    try {
      const issueData = {
        series_id: seriesId,
        issue_number: gcdIssue.number,
        variant: gcdIssue.volume || null,
        release_date: this.parsePublicationDate(gcdIssue.publication_date)?.toISOString().split('T')[0] || null,
        key_issue: false, // Could be enhanced with key issue detection logic
        key_issue_notes: gcdIssue.title && !gcdIssue.no_title ? gcdIssue.title : null,
        synopsis: gcdIssue.title && !gcdIssue.no_title ? gcdIssue.title : null
      };

      if (this.config.dryRun) {
        console.log('    📝 [DRY RUN] Would upsert issue:', gcdIssue.number);
        return true;
      }

      // Check if issue already exists
      const { data: existingIssue, error: selectError } = await this.supabase
        .from('comic_issues')
        .select('id')
        .eq('series_id', seriesId)
        .eq('issue_number', gcdIssue.number)
        .eq('variant', gcdIssue.volume || null)
        .maybeSingle();

      if (selectError) {
        throw selectError;
      }

      if (existingIssue) {
        // Update existing issue
        const { error: updateError } = await this.supabase
          .from('comic_issues')
          .update(issueData)
          .eq('id', existingIssue.id);

        if (updateError) throw updateError;
      } else {
        // Insert new issue
        const { error: insertError } = await this.supabase
          .from('comic_issues')
          .insert(issueData);

        if (insertError) throw insertError;
      }

      return true;
    } catch (error) {
      const errorMsg = `Failed to upsert issue ${gcdIssue.number}: ${error}`;
      this.stats.errors.push(errorMsg);
      console.error('    ❌', errorMsg);
      return false;
    }
  }

  async processPublisher(publisher: GCDPublisher): Promise<void> {
    console.log(`\n🏢 Processing publisher: ${publisher.name}`);
    
    const series = await this.getSeriesForPublisher(publisher.id, publisher.name);
    
    for (let i = 0; i < series.length; i++) {
      const gcdSeries = series[i];
      console.log(`\n  📖 Processing series ${i + 1}/${series.length}: ${gcdSeries.name}`);
      
      const seriesId = await this.upsertSeries(gcdSeries, publisher.name);
      
      if (!seriesId) {
        this.stats.seriesSkipped++;
        continue;
      }
      
      this.stats.seriesProcessed++;
      
      // Get and process issues for this series
      const issues = await this.getIssuesForSeries(gcdSeries.id, gcdSeries.name);
      console.log(`    📚 Processing ${issues.length} issues...`);
      
      let issuesBatch: GCDIssue[] = [];
      
      for (const gcdIssue of issues) {
        issuesBatch.push(gcdIssue);
        
        // Process issues in batches
        if (issuesBatch.length >= this.config.batchSize) {
          await this.processBatchOfIssues(issuesBatch, seriesId);
          issuesBatch = [];
        }
      }
      
      // Process remaining issues in the batch
      if (issuesBatch.length > 0) {
        await this.processBatchOfIssues(issuesBatch, seriesId);
      }
      
      console.log(`    ✅ Completed processing ${gcdSeries.name}`);
    }
  }

  async processBatchOfIssues(issues: GCDIssue[], seriesId: string): Promise<void> {
    for (const issue of issues) {
      const success = await this.upsertIssue(issue, seriesId);
      
      if (success) {
        this.stats.issuesProcessed++;
      } else {
        this.stats.issuesSkipped++;
      }
    }
  }

  printStats(): void {
    this.stats.endTime = new Date();
    const duration = this.stats.endTime.getTime() - this.stats.startTime.getTime();
    const durationMinutes = Math.round(duration / 60000);
    
    console.log('\n📊 Processing Statistics:');
    console.log('========================');
    console.log(`⏱️  Duration: ${durationMinutes} minutes`);
    console.log(`📖 Series processed: ${this.stats.seriesProcessed}`);
    console.log(`📖 Series skipped: ${this.stats.seriesSkipped}`);
    console.log(`📚 Issues processed: ${this.stats.issuesProcessed}`);
    console.log(`📚 Issues skipped: ${this.stats.issuesSkipped}`);
    console.log(`❌ Errors encountered: ${this.stats.errors.length}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Error Details:');
      this.stats.errors.slice(0, 10).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
      
      if (this.stats.errors.length > 10) {
        console.log(`  ... and ${this.stats.errors.length - 10} more errors`);
      }
    }
    
    if (this.config.dryRun) {
      console.log('\n🏃 This was a DRY RUN - no data was actually written to the database');
    }
  }

  async run(): Promise<void> {
    console.log('🚀 Starting Comic Catalog Database Seeding');
    console.log('==========================================');
    console.log(`📋 Configuration:`);
    console.log(`   Batch size: ${this.config.batchSize}`);
    console.log(`   Max series: ${this.config.maxSeries || 'unlimited'}`);
    console.log(`   Max issues per series: ${this.config.maxIssues || 'unlimited'}`);
    console.log(`   Dry run: ${this.config.dryRun}`);
    
    try {
      await this.connect();
      
      const publishers = await this.getPublishers();
      
      for (const publisher of publishers) {
        await this.processPublisher(publisher);
      }
      
      console.log('\n🎉 Comic catalog seeding completed successfully!');
      
    } catch (error) {
      console.error('\n💥 Fatal error during seeding:', error);
      this.stats.errors.push(`Fatal error: ${error}`);
    } finally {
      this.printStats();
      
      // Close database connections
      await this.gcdDb.end();
    }
  }
}

// Main execution
async function main() {
  const seeder = new ComicDataSeeder();
  await seeder.run();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default ComicDataSeeder;