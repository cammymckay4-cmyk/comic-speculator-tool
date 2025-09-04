import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, BookOpen } from 'lucide-react'
import ComicCard from '@/components/ui/ComicCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { searchPublicComics, type SearchResultComic, type SearchResponse } from '@/services/searchService'

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const searchTerm = searchParams.get('q') || ''

  const { data: searchResponse, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ['search', searchTerm],
    queryFn: () => searchPublicComics(searchTerm),
    enabled: !!searchTerm, // Only run query if searchTerm exists
  })

  const searchResults = searchResponse?.results || []

  // Transform SearchResultComic to ComicCard format
  const transformToComicCardData = (comic: SearchResultComic) => {
    return {
      id: comic.id,
      title: comic.title,
      issue: comic.issueNumber,
      publisher: comic.publisher,
      coverImage: comic.coverImageUrl,
      value: `£${comic.marketValue}`,
      trend: 'neutral' as const,
      change: ''
    }
  }

  return (
    <div className="min-h-screen bg-parchment py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Search className="text-stan-lee-blue" size={32} />
            <h1 className="font-super-squad text-4xl text-ink-black">
              SEARCH RESULTS
            </h1>
          </div>
          
          {searchTerm && (
            <div className="space-y-2">
              <p className="font-persona-aura text-lg text-gray-700">
                Showing results for: <strong>"{searchTerm}"</strong>
              </p>
              {searchResponse?.correctedQuery && (
                <p className="font-persona-aura text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                  <span className="font-medium">Search corrected to:</span> "{searchResponse.correctedQuery}"
                  <br />
                  <span className="text-xs text-blue-500">
                    (Removed articles like "The" and normalized hyphenated terms)
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {!searchTerm ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="font-super-squad text-2xl text-gray-600 mb-2">
              NO SEARCH QUERY
            </h2>
            <p className="font-persona-aura text-gray-500">
              Enter a search term in the navigation bar to find comics.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" text="Searching comics..." />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <h2 className="font-super-squad text-xl text-red-700 mb-2">
                SEARCH ERROR
              </h2>
              <p className="font-persona-aura text-red-600">
                {error instanceof Error ? error.message : 'Something went wrong with your search.'}
              </p>
            </div>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="font-super-squad text-2xl text-gray-600 mb-2">
              NO RESULTS FOUND
            </h2>
            <p className="font-persona-aura text-gray-500">
              No comics found matching "{searchTerm}". Try a different search term.
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="font-persona-aura text-gray-600">
                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {searchResults.map((comic) => (
                <ComicCard
                  key={comic.id}
                  comic={transformToComicCardData(comic)}
                  onClick={() => {
                    // Navigate to comic detail page when clicked
                    window.location.href = `/comic/${comic.id}`
                  }}
                  variant="default"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage