export interface CommonApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}

export interface Author {
  id: string;
  avatar_url: string;
  profile_pic: string;
}

export interface Post {
  author: Author;
  circles: null[];
  comments: null[];
  content: string;
  created_at_seconds: number;
  id: string;
  is_public: boolean;
  media_urls: string[];
  reactions: string[];
  reshareable: boolean;
  reshared_from: null;
}
