CREATE SEQUENCE public.scraped_articles_id_seq;

CREATE TABLE public.scraped_articles
(
    id bigint NOT NULL DEFAULT nextval('public.scraped_articles_id_seq'),
    source_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    url text COLLATE pg_catalog."default" NOT NULL,
    title text COLLATE pg_catalog."default",
    text text COLLATE pg_catalog."default",
    last_updated timestamp with time zone,
    scraped_at timestamp with time zone NOT NULL,
    spider_name character(64) COLLATE pg_catalog."default",
    parse_function character(64) COLLATE pg_catalog."default",
    result character(50) COLLATE pg_catalog."default" NOT NULL,
    error text COLLATE pg_catalog."default",
    error_details text COLLATE pg_catalog."default",
    CONSTRAINT scraped_articles_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.scraped_articles
    OWNER to sa;
	
ALTER SEQUENCE public.scraped_articles_id_seq OWNED BY public.scraped_articles.id;