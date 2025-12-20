export interface Tag {
    id: number;
    name_en: string;
    name_zh: string;
    category: string;
    is_negative: boolean;
    image_url?: string;
    wiki_url?: string;
    is_custom?: boolean;
}

export interface Collection {
    id: number;
    user_id?: number;
    name: string;
    tags_string: string;
    tags_count?: number;
    preview_image_url?: string | null;
    created_at?: string;
    updated_at?: string;
}
