import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '@/lib/supabaseClient'
import {
  fetchUserCollection,
  getCollectionCount,
  fetchComicById,
  getCollectionStats,
  addComic,
  updateComic,
  deleteComic,
  fetchAllComicsForUser,
  type AddComicData,
  type SupabaseComic
} from './collectionService'
import type { CollectionComic } from '@/lib/types'

// Mock data for testing
const mockSupabaseComic: SupabaseComic = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Amazing Spider-Man',
  issue: '#1',
  publisher: 'Marvel Comics',
  coverImage: 'https://example.com/cover.jpg',
  marketValue: 1500,
  condition: 'near-mint',
  purchasePrice: 500,
  purchaseDate: '2024-01-15',
  purchaseLocation: 'Comic Shop',
  notes: 'First appearance of Spider-Man',
  publicationYear: 1963,
  format: 'single-issue',
  isKeyIssue: true,
  keyIssueReason: 'First appearance',
  createdAt: '2024-01-15T10:00:00Z',
  userId: 'user-123'
}

const mockAddComicData: AddComicData = {
  title: 'X-Men',
  issueNumber: '#1',
  publisher: 'Marvel Comics',
  publicationYear: 1963,
  condition: 'very-fine',
  format: 'single-issue',
  estimatedValue: 2000,
  purchasePrice: 800,
  purchaseDate: '2024-02-01',
  purchaseLocation: 'Online Store',
  coverImageUrl: 'https://example.com/xmen1.jpg',
  notes: 'First X-Men issue',
  isKeyIssue: true,
  keyIssueReason: 'First appearance of X-Men',
  addedDate: '2024-02-01T10:00:00Z'
}

describe('collectionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchUserCollection', () => {
    it('should fetch user collection successfully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.range.mockResolvedValue({
        data: [mockSupabaseComic],
        error: null
      })

      const result = await fetchUserCollection('user-123')

      expect(result).toHaveLength(1)
      expect(result[0].comicId).toBe(mockSupabaseComic.id)
      expect(result[0].comic.title).toBe(mockSupabaseComic.title)
      expect(supabase.from).toHaveBeenCalledWith('comics')
      expect(mockQuery.eq).toHaveBeenCalledWith('userId', 'user-123')
    })

    it('should throw error when user ID is not provided', async () => {
      await expect(fetchUserCollection('')).rejects.toThrow('User ID is required')
    })

    it('should handle database errors', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.range.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      })

      await expect(fetchUserCollection('user-123')).rejects.toThrow('Failed to fetch collection: Database connection failed')
    })

    it('should apply search filter', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.range.mockResolvedValue({
        data: [mockSupabaseComic],
        error: null
      })

      await fetchUserCollection('user-123', {
        filters: { searchTerm: 'Spider-Man' }
      })

      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%Spider-Man%,issue.ilike.%Spider-Man%,publisher.ilike.%Spider-Man%')
    })

    it('should apply publisher filter', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.range.mockResolvedValue({
        data: [mockSupabaseComic],
        error: null
      })

      await fetchUserCollection('user-123', {
        filters: { publishers: ['Marvel Comics', 'DC Comics'] }
      })

      expect(mockQuery.in).toHaveBeenCalledWith('publisher', ['Marvel Comics', 'DC Comics'])
    })

    it('should apply price range filter', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.range.mockResolvedValue({
        data: [mockSupabaseComic],
        error: null
      })

      await fetchUserCollection('user-123', {
        filters: { priceRange: { min: 100, max: 2000 } }
      })

      expect(mockQuery.gte).toHaveBeenCalledWith('marketValue', 100)
      expect(mockQuery.lte).toHaveBeenCalledWith('marketValue', 2000)
    })
  })

  describe('getCollectionCount', () => {
    it('should get collection count successfully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.eq.mockResolvedValue({
        count: 42,
        error: null
      })

      const result = await getCollectionCount('user-123')

      expect(result).toBe(42)
      expect(supabase.from).toHaveBeenCalledWith('comics')
      expect(mockQuery.select).toHaveBeenCalledWith('*', { count: 'exact', head: true })
      expect(mockQuery.eq).toHaveBeenCalledWith('userId', 'user-123')
    })

    it('should throw error when user ID is not provided', async () => {
      await expect(getCollectionCount('')).rejects.toThrow('User ID is required')
    })

    it('should handle database errors', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.eq.mockResolvedValue({
        count: null,
        error: { message: 'Count query failed' }
      })

      await expect(getCollectionCount('user-123')).rejects.toThrow('Failed to get collection count: Count query failed')
    })

    it('should return 0 when count is null', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.eq.mockResolvedValue({
        count: null,
        error: null
      })

      const result = await getCollectionCount('user-123')
      expect(result).toBe(0)
    })
  })

  describe('fetchComicById', () => {
    it('should fetch comic by ID successfully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.single.mockResolvedValue({
        data: mockSupabaseComic,
        error: null
      })

      const result = await fetchComicById('123e4567-e89b-12d3-a456-426614174000')

      expect(result.comicId).toBe(mockSupabaseComic.id)
      expect(result.comic.title).toBe(mockSupabaseComic.title)
      expect(supabase.from).toHaveBeenCalledWith('comics')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000')
    })

    it('should throw error when comic ID is not provided', async () => {
      await expect(fetchComicById('')).rejects.toThrow('Comic ID is required')
    })

    it('should handle database errors', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Comic not found in database' }
      })

      await expect(fetchComicById('nonexistent-id')).rejects.toThrow('Failed to fetch comic: Comic not found in database')
    })

    it('should throw error when no data is returned', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: null
      })

      await expect(fetchComicById('nonexistent-id')).rejects.toThrow('Comic not found')
    })
  })

  describe('getCollectionStats', () => {
    it('should calculate collection stats correctly', () => {
      const mockComics: CollectionComic[] = [
        {
          comicId: '1',
          comic: {
            id: '1',
            title: 'Comic 1',
            issue: '#1',
            issueNumber: 1,
            publisher: 'Marvel',
            publishDate: '2024-01-01',
            coverImage: '',
            creators: [],
            format: 'single-issue',
            isVariant: false,
            isKeyIssue: true,
            prices: [],
            marketValue: 100,
            lastUpdated: '2024-01-01'
          },
          condition: 'near-mint',
          addedDate: '2024-01-01'
        },
        {
          comicId: '2',
          comic: {
            id: '2',
            title: 'Comic 2',
            issue: '#2',
            issueNumber: 2,
            publisher: 'DC',
            publishDate: '2024-01-02',
            coverImage: '',
            creators: [],
            format: 'single-issue',
            isVariant: false,
            isKeyIssue: false,
            prices: [],
            marketValue: 200,
            lastUpdated: '2024-01-02'
          },
          condition: 'very-fine',
          addedDate: '2024-01-02'
        }
      ]

      const stats = getCollectionStats(mockComics)

      expect(stats.totalComics).toBe(2)
      expect(stats.totalValue).toBe(300)
      expect(stats.averageValue).toBe(150)
      expect(stats.keyIssues).toBe(1)
    })

    it('should handle empty collection', () => {
      const stats = getCollectionStats([])

      expect(stats.totalComics).toBe(0)
      expect(stats.totalValue).toBe(0)
      expect(stats.averageValue).toBe(0)
      expect(stats.keyIssues).toBe(0)
    })
  })

  describe('addComic', () => {
    it('should add comic successfully', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.single.mockResolvedValue({
        data: mockSupabaseComic,
        error: null
      })

      const result = await addComic('user-123', mockAddComicData)

      expect(result.comicId).toBe(mockSupabaseComic.id)
      expect(result.comic.title).toBe(mockSupabaseComic.title)
      expect(supabase.from).toHaveBeenCalledWith('comics')
      expect(mockQuery.insert).toHaveBeenCalledWith([expect.objectContaining({
        userId: 'user-123',
        title: mockAddComicData.title,
        issue: mockAddComicData.issueNumber,
        publisher: mockAddComicData.publisher,
      })])
    })

    it('should throw error when user ID is not provided', async () => {
      await expect(addComic('', mockAddComicData)).rejects.toThrow('User ID is required')
    })

    it('should handle database errors during insertion', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' }
      })

      await expect(addComic('user-123', mockAddComicData)).rejects.toThrow('Failed to add comic: Insert failed')
    })

    it('should throw error when no data is returned from insertion', async () => {
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: null
      })

      await expect(addComic('user-123', mockAddComicData)).rejects.toThrow('No data returned from comic creation')
    })
  })

  describe('updateComic', () => {
    it('should update comic successfully', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.single.mockResolvedValue({
        data: mockSupabaseComic,
        error: null
      })

      const updateData = { title: 'Updated Title', estimatedValue: 2500 }
      const result = await updateComic('comic-123', updateData)

      expect(result.comic.title).toBe(mockSupabaseComic.title)
      expect(supabase.from).toHaveBeenCalledWith('comics')
      expect(mockQuery.update).toHaveBeenCalledWith({
        title: 'Updated Title',
        marketValue: 2500
      })
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'comic-123')
    })

    it('should throw error when comic ID is not provided', async () => {
      await expect(updateComic('', { title: 'New Title' })).rejects.toThrow('Comic ID is required')
    })

    it('should handle database errors during update', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      })

      await expect(updateComic('comic-123', { title: 'New Title' })).rejects.toThrow('Failed to update comic: Update failed')
    })

    it('should throw error when no data is returned from update', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: null
      })

      await expect(updateComic('comic-123', { title: 'New Title' })).rejects.toThrow('No data returned from comic update')
    })
  })

  describe('deleteComic', () => {
    it('should delete comic successfully', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.eq.mockResolvedValue({
        error: null
      })

      await expect(deleteComic('comic-123')).resolves.toBeUndefined()
      
      expect(supabase.from).toHaveBeenCalledWith('comics')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'comic-123')
    })

    it('should throw error when comic ID is not provided', async () => {
      await expect(deleteComic('')).rejects.toThrow('Comic ID is required')
    })

    it('should handle database errors during deletion', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.eq.mockResolvedValue({
        error: { message: 'Delete failed' }
      })

      await expect(deleteComic('comic-123')).rejects.toThrow('Failed to delete comic: Delete failed')
    })
  })

  describe('fetchAllComicsForUser', () => {
    it('should fetch all comics for user successfully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.order.mockResolvedValue({
        data: [mockSupabaseComic],
        error: null
      })

      const result = await fetchAllComicsForUser('user-123')

      expect(result).toHaveLength(1)
      expect(result[0].comicId).toBe(mockSupabaseComic.id)
      expect(supabase.from).toHaveBeenCalledWith('comics')
      expect(mockQuery.eq).toHaveBeenCalledWith('userId', 'user-123')
      expect(mockQuery.order).toHaveBeenCalledWith('createdAt', { ascending: false })
    })

    it('should throw error when user ID is not provided', async () => {
      await expect(fetchAllComicsForUser('')).rejects.toThrow('User ID is required')
    })

    it('should handle database errors', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.order.mockResolvedValue({
        data: null,
        error: { message: 'Fetch all failed' }
      })

      await expect(fetchAllComicsForUser('user-123')).rejects.toThrow('Failed to fetch all comics: Fetch all failed')
    })

    it('should return empty array when no data is returned', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      }
      
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)
      mockQuery.order.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await fetchAllComicsForUser('user-123')
      expect(result).toEqual([])
    })
  })
})