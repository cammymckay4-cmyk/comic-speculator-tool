-- =====================================================
-- Phase 6: Gamification & Social Features
-- File: 006_gamification_social.sql
-- Description: Add trophy system and social features (user following)
-- =====================================================

-- =====================================================
-- TROPHY SYSTEM TABLES
-- =====================================================

-- Trophies table - defines all available achievements
CREATE TABLE IF NOT EXISTS trophies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'collection', 'trading', 'social', 'milestone'
    icon TEXT, -- Icon identifier for UI
    rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    points INTEGER DEFAULT 10, -- Points awarded when earned
    requirements JSONB, -- Flexible requirements structure
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_trophy_category CHECK (category IN ('collection', 'trading', 'social', 'milestone')),
    CONSTRAINT chk_trophy_rarity CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    CONSTRAINT chk_trophy_points CHECK (points >= 0)
);

-- User trophies table - tracks which users have earned which trophies
CREATE TABLE IF NOT EXISTS user_trophies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trophy_id UUID NOT NULL REFERENCES trophies(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    progress_data JSONB, -- Store progress information if needed
    
    -- Ensure users can only earn each trophy once
    UNIQUE(user_id, trophy_id)
);

-- =====================================================
-- SOCIAL FEATURES TABLES
-- =====================================================

-- User follows table - tracks who follows whom
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique follow relationships and prevent self-following
    UNIQUE(follower_id, following_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id != following_id)
);

-- =====================================================
-- SEED INITIAL TROPHY DATA
-- =====================================================

INSERT INTO trophies (name, description, category, icon, rarity, points, requirements) VALUES
-- Collection Milestones
('First Comic', 'Add your first comic to your collection', 'collection', 'trophy', 'common', 10, '{"type": "collection_count", "threshold": 1}'),
('Growing Collection', 'Collect 10 different comics', 'collection', 'medal', 'common', 25, '{"type": "collection_count", "threshold": 10}'),
('Serious Collector', 'Collect 50 different comics', 'collection', 'award', 'rare', 100, '{"type": "collection_count", "threshold": 50}'),
('Comic Connoisseur', 'Collect 100 different comics', 'collection', 'star', 'epic', 250, '{"type": "collection_count", "threshold": 100}'),
('Master Collector', 'Collect 500 different comics', 'collection', 'crown', 'legendary', 1000, '{"type": "collection_count", "threshold": 500}'),

-- Key Issue Milestones
('Key Issue Hunter', 'Collect your first key issue', 'collection', 'key', 'rare', 50, '{"type": "key_issue_count", "threshold": 1}'),
('Key Issue Expert', 'Collect 10 key issues', 'collection', 'gem', 'epic', 200, '{"type": "key_issue_count", "threshold": 10}'),

-- Grading Milestones
('Graded Guardian', 'Collect your first graded comic', 'collection', 'shield', 'rare', 75, '{"type": "graded_count", "threshold": 1}'),

-- Social Milestones
('First Friend', 'Follow your first user', 'social', 'users', 'common', 15, '{"type": "following_count", "threshold": 1}'),
('Social Butterfly', 'Follow 10 users', 'social', 'heart', 'rare', 50, '{"type": "following_count", "threshold": 10}'),
('Popular Collector', 'Gain 10 followers', 'social', 'trending-up', 'rare', 75, '{"type": "followers_count", "threshold": 10}'),
('Community Leader', 'Gain 50 followers', 'social', 'users-2', 'epic', 300, '{"type": "followers_count", "threshold": 50}'),

-- Trading Milestones  
('Deal Hunter', 'Find your first great deal (score > 70)', 'trading', 'target', 'common', 20, '{"type": "deal_score", "threshold": 70}'),
('Bargain Master', 'Find 10 great deals (score > 70)', 'trading', 'zap', 'rare', 100, '{"type": "deal_count", "threshold": 10, "min_score": 70}'),

-- Value Milestones
('Growing Investment', 'Have a collection worth over £1,000', 'milestone', 'trending-up', 'rare', 100, '{"type": "collection_value", "threshold": 1000}'),
('Serious Investment', 'Have a collection worth over £5,000', 'milestone', 'bar-chart', 'epic', 500, '{"type": "collection_value", "threshold": 5000}'),
('Major Investment', 'Have a collection worth over £10,000', 'milestone', 'diamond', 'legendary', 1000, '{"type": "collection_value", "threshold": 10000}');

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Trophy indexes
CREATE INDEX IF NOT EXISTS idx_trophies_category ON trophies (category);
CREATE INDEX IF NOT EXISTS idx_trophies_rarity ON trophies (rarity);
CREATE INDEX IF NOT EXISTS idx_trophies_active ON trophies (is_active) WHERE is_active = TRUE;

-- User trophies indexes
CREATE INDEX IF NOT EXISTS idx_user_trophies_user_id ON user_trophies (user_id);
CREATE INDEX IF NOT EXISTS idx_user_trophies_trophy_id ON user_trophies (trophy_id);
CREATE INDEX IF NOT EXISTS idx_user_trophies_earned_at ON user_trophies (earned_at DESC);

-- User follows indexes
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows (following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows (created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on trophy tables
ALTER TABLE trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Trophies policies - everyone can read trophies
CREATE POLICY "Anyone can view trophies"
    ON trophies FOR SELECT
    USING (is_active = TRUE);

-- User trophies policies - users can view their own trophies
CREATE POLICY "Users can view their own trophies"
    ON user_trophies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' trophies"
    ON user_trophies FOR SELECT
    USING (TRUE); -- Allow viewing other users' trophies for social features

-- Only system can insert/update trophies (this would be handled by functions)
CREATE POLICY "System can manage user trophies"
    ON user_trophies FOR ALL
    USING (auth.uid() IS NOT NULL); -- Authenticated users (system operations)

-- User follows policies
CREATE POLICY "Users can view follows"
    ON user_follows FOR SELECT
    USING (TRUE); -- Allow viewing follow relationships for social features

CREATE POLICY "Users can follow others"
    ON user_follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
    ON user_follows FOR DELETE
    USING (auth.uid() = follower_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's trophy count and total points
CREATE OR REPLACE FUNCTION get_user_trophy_stats(p_user_id UUID)
RETURNS TABLE (
    total_trophies BIGINT,
    total_points BIGINT,
    common_count BIGINT,
    rare_count BIGINT,
    epic_count BIGINT,
    legendary_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_trophies,
        COALESCE(SUM(t.points), 0) as total_points,
        COUNT(*) FILTER (WHERE t.rarity = 'common') as common_count,
        COUNT(*) FILTER (WHERE t.rarity = 'rare') as rare_count,
        COUNT(*) FILTER (WHERE t.rarity = 'epic') as epic_count,
        COUNT(*) FILTER (WHERE t.rarity = 'legendary') as legendary_count
    FROM user_trophies ut
    JOIN trophies t ON ut.trophy_id = t.id
    WHERE ut.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get user's social stats
CREATE OR REPLACE FUNCTION get_user_social_stats(p_user_id UUID)
RETURNS TABLE (
    followers_count BIGINT,
    following_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM user_follows WHERE following_id = p_user_id) as followers_count,
        (SELECT COUNT(*) FROM user_follows WHERE follower_id = p_user_id) as following_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================

-- Update trigger for trophies table
CREATE TRIGGER update_trophies_updated_at
    BEFORE UPDATE ON trophies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT ON trophies TO authenticated;
GRANT SELECT ON user_trophies TO authenticated;
GRANT SELECT, INSERT, DELETE ON user_follows TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_trophy_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_social_stats(UUID) TO authenticated;

-- Log completion
INSERT INTO migration_log (migration_file, status, completed_at) 
VALUES ('006_gamification_social.sql', 'completed', NOW());