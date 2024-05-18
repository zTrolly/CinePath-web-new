import axios, { AxiosRequestConfig } from 'axios'
import { isObject, isString, merge, omit } from 'lodash'
import PromiseThrottle from 'promise-throttle'
import { HttpMethod, AuthenticationToken, RequestParams, SessionRequestParams, SessionResponse } from '../types/types'
import * as types from '../types/request-types'

export class MovieDb {
  private apiKey: string
  private token: AuthenticationToken | undefined
  private queue: PromiseThrottle
  public baseUrl: string
  public sessionId: string | undefined

  constructor(apiKey: string, baseUrl: string = 'https://api.themoviedb.org/3/', requestsPerSecondLimit: number = 50) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.queue = new PromiseThrottle({
      requestsPerSecond: requestsPerSecondLimit,
      promiseImplementation: Promise,
    })
  }

  async requestToken(): Promise<AuthenticationToken> {
    if (!this.token || (this.token.expires_at && Date.now() > new Date(this.token.expires_at).getTime())) {
      this.token = await this.makeRequest(HttpMethod.Get, 'authentication/token/new')
    }

    return this.token!
  }


  async retrieveSession(): Promise<string | undefined> {
    const token = await this.requestToken()
    const request: SessionRequestParams = {
      request_token: token.request_token || '',
    }

    const res: SessionResponse = await this.makeRequest(HttpMethod.Get, 'authentication/session/new', request)

    this.sessionId = res.session_id

    return this.sessionId
  }


  private getEndpoint(endpoint: string, params: RequestParams = {}): string {
    return Object.keys(params).reduce((compiled, key) => {
      return compiled.replace(`:${key}`, params[key as keyof RequestParams] as string)
    }, endpoint)
  }


  private normalizeParams(endpoint: string, params: string | number | RequestParams = {}): RequestParams {
    if (isObject(params)) {
      return params
    }

    const matches = endpoint.match(/:[a-z]*/g) || []

    if (matches.length === 1) {
      return matches.reduce((obj, match) => {
        obj[match.slice(1) as string] = params

        return obj
      }, {} as {[key: string]: string | number})
    }

    return {}
  }

  
  private getParams(endpoint: string, params: RequestParams = {}): RequestParams {
    const compiledParams: RequestParams = merge(
      {
        api_key: this.apiKey,
        ...(this.sessionId && { session_id: this.sessionId }),
      },
      params,
    )

    if (endpoint.includes(':id') && !compiledParams.id && this.sessionId) {
      compiledParams.id = '{account_id}'
    }

    return compiledParams
  }


  private makeRequest(
    method: HttpMethod,
    endpoint: string,
    params: string | number | RequestParams = {},
    axiosConfig: AxiosRequestConfig = {},
  ): Promise<any> {
    const normalizedParams: RequestParams = this.normalizeParams(endpoint, params)

    const fullQuery: RequestParams = this.getParams(endpoint, normalizedParams)

    const omittedProps = [...(endpoint.match(/:[a-z]*/gi) ?? [])].map((prop) => prop.slice(1))

    const query = omit(fullQuery, omittedProps)

    const request: AxiosRequestConfig = {
      method,
      url: this.baseUrl + this.getEndpoint(endpoint, fullQuery),
      ...(method === HttpMethod.Get && { params: query }),
      ...(method !== HttpMethod.Get && { data: query }),
      ...axiosConfig,
    }

    return this.queue.add(async () => (await axios.request(request)).data)
  }

  private parseSearchParams(params: string | types.SearchRequest): types.SearchRequest {
    if (isString(params)) {
      return { query: params }
    }

    return params
  }

  configuration(axiosConfig?: AxiosRequestConfig): Promise<types.ConfigurationResponse> {
    return this.makeRequest(HttpMethod.Get, 'configuration', {}, axiosConfig)
  }

  countries(axiosConfig?: AxiosRequestConfig): Promise<types.CountriesResponse> {
    return this.makeRequest(HttpMethod.Get, 'configuration/countries', {}, axiosConfig)
  }

  jobs(axiosConfig?: AxiosRequestConfig): Promise<Array<types.Job>> {
    return this.makeRequest(HttpMethod.Get, 'configuration/jobs', {}, axiosConfig)
  }

  languages(axiosConfig?: AxiosRequestConfig): Promise<Array<types.Language>> {
    return this.makeRequest(HttpMethod.Get, 'configuration/languages', {}, axiosConfig)
  }

  primaryTranslations(axiosConfig?: AxiosRequestConfig): Promise<Array<string>> {
    return this.makeRequest(HttpMethod.Get, 'configuration/primary_translations', {}, axiosConfig)
  }

  timezones(axiosConfig?: AxiosRequestConfig): Promise<Array<types.Timezone>> {
    return this.makeRequest(HttpMethod.Get, 'configuration/timezones', {}, axiosConfig)
  }

  find(params?: types.FindRequest, axiosConfig?: AxiosRequestConfig): Promise<types.FindResponse> {
    return this.makeRequest(HttpMethod.Get, 'find/:id', params, axiosConfig)
  }

  searchCompany(
    params: string | types.SearchRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.SearchCompanyResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/company', this.parseSearchParams(params), axiosConfig)
  }

  searchCollection(
    params: types.SearchRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.SearchCollectionResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/collection', this.parseSearchParams(params), axiosConfig)
  }

  searchKeyword(params: types.SearchRequest, axiosConfig?: AxiosRequestConfig): Promise<types.SearchKeywordResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/keyword', this.parseSearchParams(params), axiosConfig)
  }

  searchMovie(params: types.SearchMovieRequest, axiosConfig?: AxiosRequestConfig): Promise<types.MovieResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/movie', this.parseSearchParams(params), axiosConfig)
  }

  searchMulti(params: types.SearchMultiRequest, axiosConfig?: AxiosRequestConfig): Promise<types.SearchMultiResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/multi', this.parseSearchParams(params), axiosConfig)
  }

  searchPerson(
    params: types.SearchMultiRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.SearchPersonResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/person', this.parseSearchParams(params), axiosConfig)
  }

  searchTv(params: types.SearchTvRequest, axiosConfig?: AxiosRequestConfig): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/tv', this.parseSearchParams(params), axiosConfig)
  }

  searchList(params?: string | number | RequestParams, axiosConfig?: AxiosRequestConfig): Promise<any> {
    return this.makeRequest(HttpMethod.Get, 'search/list', params, axiosConfig)
  }

  collectionInfo(
    params: string | number | types.CollectionRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.CollectionInfoResponse> {
    return this.makeRequest(HttpMethod.Get, 'collection/:id', params, axiosConfig)
  }

  collectionImages(
    params: string | number | types.CollectionRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.CollectionImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'collection/:id/images', params, axiosConfig)
  }

  collectionTranslations(
    params: string | number | types.CollectionRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.CollectionTranslationsResponse> {
    return this.makeRequest(HttpMethod.Get, 'collection/:id/translations', params, axiosConfig)
  }

  discoverMovie(
    params?: types.DiscoverMovieRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.DiscoverMovieResponse> {
    return this.makeRequest(HttpMethod.Get, 'discover/movie', params, axiosConfig)
  }

  discoverTv(params?: types.DiscoverTvRequest, axiosConfig?: AxiosRequestConfig): Promise<types.DiscoverTvResponse> {
    return this.makeRequest(HttpMethod.Get, 'discover/tv', params, axiosConfig)
  }

  trending(params: types.TrendingRequest, axiosConfig?: AxiosRequestConfig): Promise<types.TrendingResponse> {
    return this.makeRequest(HttpMethod.Get, 'trending/:media_type/:time_window', params, axiosConfig)
  }

  movieInfo(
    params: string | number | types.IdAppendToResponseRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id', params, axiosConfig)
  }

  movieAccountStates(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieAccountStateResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/account_states', params, axiosConfig)
  }

  movieAlternativeTitles(
    params: string | number | types.MovieAlternativeTitlesRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieAlternativeTitlesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/alternative_titles', params, axiosConfig)
  }

  movieChanges(
    params: string | number | types.ChangesRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieChangesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/changes', params, axiosConfig)
  }

  movieCredits(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.CreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/credits', params, axiosConfig)
  }

  movieExternalIds(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieExternalIdsResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/external_ids', params, axiosConfig)
  }

  movieImages(
    params: string | number | types.MovieImagesRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/images', params, axiosConfig)
  }

  movieKeywords(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieKeywordResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/keywords', params, axiosConfig)
  }

  movieReleaseDates(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieReleaseDatesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/release_dates', params, axiosConfig)
  }

  movieVideos(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.VideosResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/videos', params, axiosConfig)
  }

  movieWatchProviders(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.WatchProviderResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/watch/providers', params, axiosConfig)
  }

  movieWatchProviderList(
    params: types.WatchProvidersParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.WatchProviderListResponse> {
    return this.makeRequest(HttpMethod.Get, 'watch/providers/movie', params, axiosConfig)
  }

  movieTranslations(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieTranslationsResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/translations', params, axiosConfig)
  }

  movieRecommendations(
    params: string | number | types.MovieRecommendationsRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieRecommendationsResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/recommendations', params, axiosConfig)
  }

  movieSimilar(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.SimilarMovieResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/similar', params, axiosConfig)
  }

  movieReviews(
    params: string | number | types.MovieReviewsRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieReviewsResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/reviews', params, axiosConfig)
  }

  movieLists(
    params: string | number | types.MovieListsRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieListsResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/lists', params, axiosConfig)
  }

  movieRatingUpdate(params: types.RatingRequest, axiosConfig?: AxiosRequestConfig): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Post, 'movie/:id/rating', params, axiosConfig)
  }

  movieRatingDelete(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Delete, 'movie/:id/rating', params, axiosConfig)
  }

  movieLatest(params?: string | RequestParams, axiosConfig?: AxiosRequestConfig): Promise<types.MovieResponse> {
    return this.makeRequest(
      HttpMethod.Get,
      'movie/latest',
      isString(params) ? { language: params } : params,
      axiosConfig,
    )
  }

  movieNowPlaying(
    params?: types.MovieNowPlayingRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.MovieNowPlayingResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/now_playing', params, axiosConfig)
  }

  moviePopular(
    params?: types.PopularMoviesRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.PopularMoviesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/popular', params, axiosConfig)
  }

  movieTopRated(
    params?: types.TopRatedMoviesRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TopRatedMoviesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/top_rated', params, axiosConfig)
  }

  upcomingMovies(
    params: types.UpcomingMoviesRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.UpcomingMoviesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/upcoming', params, axiosConfig)
  }

  tvInfo(
    params: string | number | types.IdAppendToResponseRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.ShowResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id', params, axiosConfig)
  }

  tvAccountStates(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.ShowAccountStatesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/account_states', params, axiosConfig)
  }

  tvAlternativeTitles(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.ShowAlternativeTitlesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/alternative_titles', params, axiosConfig)
  }

  tvChanges(
    params: string | number | types.ChangesRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.ShowChangesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/changes', params, axiosConfig)
  }

  tvContentRatings(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.ShowContentRatingResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/content_ratings', params, axiosConfig)
  }

  tvCredits(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.CreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/credits', params, axiosConfig)
  }
  tvAggregateCredits(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.AggregateCreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/aggregate_credits', params, axiosConfig)
  }
  episodeGroups(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TvEpisodeGroupsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/episode_groups', params, axiosConfig)
  }

  tvExternalIds(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TvExternalIdsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/external_ids', params, axiosConfig)
  }

  tvImages(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TvImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/images', params, axiosConfig)
  }

  tvKeywords(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TvKeywordsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/keywords', params, axiosConfig)
  }

  tvRecommendations(
    params: string | number | types.IdPagedRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/recommendations', params, axiosConfig)
  }

  tvReviews(
    params: string | number | types.IdPagedRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TvReviewsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/reviews', params, axiosConfig)
  }

  tvScreenedTheatrically(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TvScreenTheatricallyResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/screened_theatrically', params, axiosConfig)
  }

  tvSimilar(
    params: string | number | types.IdPagedRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TvSimilarShowsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/similar', params, axiosConfig)
  }

  tvTranslations(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TvTranslationsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/translations', params, axiosConfig)
  }

  tvVideos(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.VideosResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/videos', params, axiosConfig)
  }

  tvWatchProviders(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.WatchProviderResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/watch/providers', params, axiosConfig)
  }

  tvWatchProviderList(
    params: types.WatchProvidersParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.WatchProviderListResponse> {
    return this.makeRequest(HttpMethod.Get, 'watch/providers/tv', params, axiosConfig)
  }

  tvRatingUpdate(params: types.RatingRequest, axiosConfig?: AxiosRequestConfig): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Post, 'tv/:id/rating', params, axiosConfig)
  }

  tvRatingDelete(
    params: string | number | types.IdRequestParams,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Delete, 'tv/:id/rating', params, axiosConfig)
  }

  tvLatest(params?: RequestParams, axiosConfig?: AxiosRequestConfig): Promise<types.ShowResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/latest', params, axiosConfig)
  }

  tvAiringToday(params?: types.PagedRequestParams, axiosConfig?: AxiosRequestConfig): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/airing_today', params, axiosConfig)
  }

  tvOnTheAir(params?: types.PagedRequestParams, axiosConfig?: AxiosRequestConfig): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/on_the_air', params, axiosConfig)
  }

  tvPopular(params?: types.PagedRequestParams, axiosConfig?: AxiosRequestConfig): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/popular', params, axiosConfig)
  }

  tvTopRated(params?: types.PagedRequestParams, axiosConfig?: AxiosRequestConfig): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/top_rated', params, axiosConfig)
  }

  seasonInfo(params: types.TvSeasonRequest, axiosConfig?: AxiosRequestConfig): Promise<types.TvSeasonResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number', params, axiosConfig)
  }

  seasonChanges(
    params: types.ChangesRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TvSeasonChangesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/season/:id/changes', params, axiosConfig)
  }

  seasonAccountStates(
    params: types.TvSeasonRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TvSeasonAccountStatesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/account_states', params, axiosConfig)
  }

  seasonCredits(params: types.TvSeasonRequest, axiosConfig?: AxiosRequestConfig): Promise<types.CreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/credits', params, axiosConfig)
  }

  seasonAggregateCredits(params: types.TvAggregateCreditsRequest, axiosConfig?: AxiosRequestConfig): Promise<types.CreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/aggregate_credits', params, axiosConfig)
  }

  seasonExternalIds(
    params: types.TvSeasonRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.TvSeasonExternalIdsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/external_ids', params, axiosConfig)
  }

  seasonImages(params: types.TvSeasonRequest, axiosConfig?: AxiosRequestConfig): Promise<types.TvSeasonImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/images', params, axiosConfig)
  }

  seasonVideos(params: types.TvSeasonRequest, axiosConfig?: AxiosRequestConfig): Promise<types.VideosResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/videos', params, axiosConfig)
  }

  episodeInfo(params: types.EpisodeRequest, axiosConfig?: AxiosRequestConfig): Promise<types.Episode> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number', params, axiosConfig)
  }

  episodeChanges(
    params: string | number | types.ChangesRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.EpisodeChangesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/episode/:id/changes', params, axiosConfig)
  }

  episodeAccountStates(
    params: types.EpisodeRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.EpisodeAccountStatesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number/account_states', params, axiosConfig)
  }

  episodeCredits(params: types.EpisodeRequest, axiosConfig?: AxiosRequestConfig): Promise<types.CreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number/credits', params, axiosConfig)
  }

  episodeExternalIds(
    params: types.EpisodeRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.EpisodeExternalIdsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number/external_ids', params, axiosConfig)
  }

  episodeImages(params: types.EpisodeRequest, axiosConfig?: AxiosRequestConfig): Promise<types.EpisodeImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number/images', params, axiosConfig)
  }

  episodeTranslations(
    params: types.EpisodeRequest,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<types.EpisodeTranslationsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number/translations', params, axiosConfig)
  }

  episodeVideos(params: types.EpisodeRequest, axiosConfig?: AxiosRequestConfig): Promise<types.VideosResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number/videos', params, axiosConfig)
  }
    
}

 