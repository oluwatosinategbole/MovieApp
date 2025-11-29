import { Account, Client, Databases, ID, Query } from "react-native-appwrite";

// Environment variables
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const METRICS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!; // metrics
const SAVED_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_SAVED_COLLECTION_ID!; // savedMovies table ID

// Appwrite client
const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const database = new Databases(client);
const account = new Account(client);

// Type for saved movies documents
export type SavedMovie = {
  $id: string;
  userId: string;
  movie_id: number;
  title: string;
  poster_url: string;
  release_date: string;
};

// ------------- SEARCH METRICS (TRENDING) -------------

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      METRICS_COLLECTION_ID,
      [Query.equal("searchTerm", query)]
    );

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        METRICS_COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(
        DATABASE_ID,
        METRICS_COLLECTION_ID,
        ID.unique(),
        {
          searchTerm: query,
          movie_id: movie.id,
          title: movie.title,
          count: 1,
          poster_url: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "",
        }
      );
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      METRICS_COLLECTION_ID,
      [Query.limit(5), Query.orderDesc("count")]
    );

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return undefined;
  }
};

// ------------- AUTH -------------

export const signUpWithEmail = async (
  name: string,
  email: string,
  password: string
) => {
  await account.create(ID.unique(), email, password, name);
  return account.createEmailPasswordSession(email, password);
};

export const signInWithEmail = async (email: string, password: string) => {
  return account.createEmailPasswordSession(email, password);
};

export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch {
    // No active session
    return null;
  }
};

export const signOut = async () => {
  await account.deleteSessions();
};

// ------------- SAVED MOVIES -------------

export const saveMovieForUser = async (
  userId: string,
  movie: {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
  }
): Promise<SavedMovie> => {
  try {
    // Avoid duplicates for same user and movie
    const existing = await database.listDocuments(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      [Query.equal("userId", userId), Query.equal("movie_id", movie.id)]
    );

    if (existing.total > 0) {
      return existing.documents[0] as unknown as SavedMovie;
    }

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "";

    const created = await database.createDocument(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        movie_id: movie.id,
        title: movie.title,
        poster_url: posterUrl,
        release_date: movie.release_date ?? "",
      }
    );

    return created as unknown as SavedMovie;
  } catch (error) {
    console.error("Error saving movie:", error);
    throw error;
  }
};

export const getSavedMoviesForUser = async (
  userId?: string | null
): Promise<SavedMovie[]> => {
  try {
    if (!userId) {
      console.warn("getSavedMoviesForUser called without userId");
      return [];
    }

    const result = await database.listDocuments(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
    );

    return result.documents as unknown as SavedMovie[];
  } catch (error) {
    console.error("Error fetching saved movies:", error);
    throw error;
  }
};

export const getSavedMovieForUser = async (
  userId: string,
  movieId: number
): Promise<SavedMovie | null> => {
  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      SAVED_COLLECTION_ID,
      [Query.equal("userId", userId), Query.equal("movie_id", movieId)]
    );

    if (result.total > 0) {
      return result.documents[0] as unknown as SavedMovie;
    }

    return null;
  } catch (error) {
    console.error("Error checking saved movie:", error);
    throw error;
  }
};

export const deleteSavedMovie = async (savedId: string): Promise<void> => {
  try {
    await database.deleteDocument(DATABASE_ID, SAVED_COLLECTION_ID, savedId);
  } catch (error) {
    console.error("Error deleting saved movie:", error);
    throw error;
  }
};