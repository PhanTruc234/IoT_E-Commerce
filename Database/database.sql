--
-- PostgreSQL database dump
--

\restrict oiwGUmUS9lMI2nD78400sdIivUvFaz5FYbJt7793C8jWsIBFBA5TtcGyLUHQAQU

-- Dumped from database version 17.11 (8a81ecb)
-- Dumped by pg_dump version 17.11 (Debian 17.11-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ConsentType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ConsentType" AS ENUM (
    'TERMS',
    'PRIVACY',
    'MARKETING_EMAIL',
    'MARKETING_SMS'
);


ALTER TYPE public."ConsentType" OWNER TO neondb_owner;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'SHIPPING',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO neondb_owner;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'COD',
    'VNPAY'
);


ALTER TYPE public."PaymentMethod" OWNER TO neondb_owner;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'UNPAID',
    'PENDING',
    'PAID',
    'FAILED'
);


ALTER TYPE public."PaymentStatus" OWNER TO neondb_owner;

--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'OUT_OF_STOCK'
);


ALTER TYPE public."ProductStatus" OWNER TO neondb_owner;

--
-- Name: ProductType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ProductType" AS ENUM (
    'SIMPLE',
    'VARIABLE',
    'COMBO'
);


ALTER TYPE public."ProductType" OWNER TO neondb_owner;

--
-- Name: ReviewModerationReason; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ReviewModerationReason" AS ENUM (
    'SPAM',
    'OFFENSIVE',
    'IRRELEVANT',
    'FAKE',
    'PERSONAL_INFO',
    'OTHER'
);


ALTER TYPE public."ReviewModerationReason" OWNER TO neondb_owner;

--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ReviewStatus" OWNER TO neondb_owner;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Role" AS ENUM (
    'CUSTOMER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO neondb_owner;

--
-- Name: SerialStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."SerialStatus" AS ENUM (
    'IN_STOCK',
    'ACTIVATED'
);


ALTER TYPE public."SerialStatus" OWNER TO neondb_owner;

--
-- Name: SpecDataType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."SpecDataType" AS ENUM (
    'TEXT',
    'NUMBER',
    'BOOLEAN'
);


ALTER TYPE public."SpecDataType" OWNER TO neondb_owner;

--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public."TicketStatus" OWNER TO neondb_owner;

--
-- Name: TicketType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."TicketType" AS ENUM (
    'GENERAL',
    'ORDER',
    'RETURN',
    'WARRANTY',
    'COMPLAINT',
    'PAYMENT',
    'SHIPPING',
    'PRIVACY'
);


ALTER TYPE public."TicketType" OWNER TO neondb_owner;

--
-- Name: UserEventType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."UserEventType" AS ENUM (
    'VIEW_PRODUCT',
    'SEARCH',
    'ADD_TO_CART',
    'VIEW_CATEGORY'
);


ALTER TYPE public."UserEventType" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "actorId" text,
    "actorEmail" text,
    role text,
    action text NOT NULL,
    entity text,
    "entityId" text,
    method text NOT NULL,
    path text NOT NULL,
    summary text,
    "statusCode" integer NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO neondb_owner;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.brands (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "logoUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.brands OWNER TO neondb_owner;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cart_items (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cart_items OWNER TO neondb_owner;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.carts (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.carts OWNER TO neondb_owner;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id text NOT NULL,
    "parentId" text,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon text,
    level integer DEFAULT 1 NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: combo_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.combo_items (
    id text NOT NULL,
    "comboId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "variantId" text
);


ALTER TABLE public.combo_items OWNER TO neondb_owner;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    name text NOT NULL,
    "variantLabel" text,
    image text,
    "unitPrice" integer NOT NULL,
    quantity integer NOT NULL,
    "lineTotal" integer NOT NULL
);


ALTER TABLE public.order_items OWNER TO neondb_owner;

--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.order_status_history (
    id text NOT NULL,
    "orderId" text NOT NULL,
    status public."OrderStatus" NOT NULL,
    note text,
    "changedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.order_status_history OWNER TO neondb_owner;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.orders (
    id text NOT NULL,
    code text NOT NULL,
    "userId" text NOT NULL,
    "recipientName" text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    note text,
    subtotal integer NOT NULL,
    "shippingFee" integer DEFAULT 0 NOT NULL,
    total integer NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "paymentMethod" public."PaymentMethod" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'UNPAID'::public."PaymentStatus" NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO neondb_owner;

--
-- Name: product_attribute_options; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_attribute_options (
    id text NOT NULL,
    "attributeId" text NOT NULL,
    value text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_attribute_options OWNER TO neondb_owner;

--
-- Name: product_attributes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_attributes (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    "isVariant" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_attributes OWNER TO neondb_owner;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    "productId" text NOT NULL,
    "imageUrl" text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.product_images OWNER TO neondb_owner;

--
-- Name: product_specifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_specifications (
    id text NOT NULL,
    "productId" text NOT NULL,
    "specificationId" text NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.product_specifications OWNER TO neondb_owner;

--
-- Name: product_variant_options; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_variant_options (
    id text NOT NULL,
    "variantId" text NOT NULL,
    "optionId" text NOT NULL
);


ALTER TABLE public.product_variant_options OWNER TO neondb_owner;

--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_variants (
    id text NOT NULL,
    "productId" text NOT NULL,
    sku text NOT NULL,
    price integer NOT NULL,
    "salePrice" integer,
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_variants OWNER TO neondb_owner;

--
-- Name: products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.products (
    id text NOT NULL,
    "categoryId" text NOT NULL,
    "brandId" text,
    sku text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    price integer NOT NULL,
    "salePrice" integer,
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    status public."ProductStatus" DEFAULT 'ACTIVE'::public."ProductStatus" NOT NULL,
    type public."ProductType" DEFAULT 'SIMPLE'::public."ProductType" NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "soldCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO neondb_owner;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.questions (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    answer text,
    "answeredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.questions OWNER TO neondb_owner;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tokenHash" text NOT NULL,
    "userAgent" text,
    "ipAddress" text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO neondb_owner;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    status public."ReviewStatus" DEFAULT 'PENDING'::public."ReviewStatus" NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "moderationReason" public."ReviewModerationReason",
    "orderId" text,
    "verifiedPurchase" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- Name: serials; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.serials (
    id text NOT NULL,
    code text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    status public."SerialStatus" DEFAULT 'IN_STOCK'::public."SerialStatus" NOT NULL,
    "warrantyMonths" integer DEFAULT 12 NOT NULL,
    "activatedAt" timestamp(3) without time zone,
    "warrantyEndAt" timestamp(3) without time zone,
    "ownerName" text,
    "ownerPhone" text,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ownerUserId" text,
    "userId" text,
    "orderId" text
);


ALTER TABLE public.serials OWNER TO neondb_owner;

--
-- Name: specifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.specifications (
    id text NOT NULL,
    name text NOT NULL,
    unit text,
    "dataType" public."SpecDataType" DEFAULT 'TEXT'::public."SpecDataType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.specifications OWNER TO neondb_owner;

--
-- Name: support_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.support_messages (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    "senderId" text,
    "isStaff" boolean DEFAULT false NOT NULL,
    body text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    attachments text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.support_messages OWNER TO neondb_owner;

--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.support_tickets (
    id text NOT NULL,
    code text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text,
    type public."TicketType" DEFAULT 'GENERAL'::public."TicketType" NOT NULL,
    status public."TicketStatus" DEFAULT 'OPEN'::public."TicketStatus" NOT NULL,
    subject text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.support_tickets OWNER TO neondb_owner;

--
-- Name: user_consents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_consents (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."ConsentType" NOT NULL,
    version text NOT NULL,
    granted boolean DEFAULT true NOT NULL,
    "grantedAt" timestamp(3) without time zone,
    "revokedAt" timestamp(3) without time zone,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_consents OWNER TO neondb_owner;

--
-- Name: user_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_events (
    id text NOT NULL,
    type public."UserEventType" NOT NULL,
    "userId" text,
    "productId" text,
    "categoryId" text,
    keyword text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_events OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text,
    "fullName" text NOT NULL,
    phone text,
    "avatarUrl" text,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isEmailVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    address text,
    "googleId" text
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0924effd-7a47-455d-af3f-1b7938125393	2004b7ebeb9ee19e4d00dd21806af65296814be71b8b6a16eda543ca23bde37b	2026-09-13 13:34:08.957894+00	20260913133408_add_audit_log	\N	\N	2026-09-13 13:34:08.642854+00	1
5d1cb0a7-0bf3-4083-a041-f97ee24e00f4	d9238691b995acbd4b00c31393cbeddc13ccf481ec9c94f7ac5667c45a63baf2	2026-09-05 19:14:08.329196+00	20260905191407_init_user	\N	\N	2026-09-05 19:14:08.070269+00	1
c17196a2-ea38-43c4-a2a7-6d3108fdbcb6	b85aa7d3dd128233d0860f3e75688338e1337d9c504d0adb64738677047f7f03	2026-09-05 19:26:08.519451+00	20260905192608_add_refresh_token	\N	\N	2026-09-05 19:26:08.244535+00	1
fb719393-2426-4132-bab0-0883dfd20fa8	e314a0de26cdc9ed317d702d15d0cc6385ec9cfc5b843d3e02db6cc31941e1c0	2026-09-06 06:39:58.169445+00	20260906063957_add_category_brand	\N	\N	2026-09-06 06:39:57.852324+00	1
0684bbd6-04e5-4e4e-af31-5c079aec85ab	e4e78df7adce52c387e88c084b3e9356beaa54760bd175ddadea5afa161ccebc	2026-09-13 18:02:55.645611+00	20260913180255_add_user_address	\N	\N	2026-09-13 18:02:55.344421+00	1
f225433d-1efb-474d-bed5-61f165a05541	50375ad587d08bf6185042979375aa741612c2a5d94fee686f38cafee49d8d37	2026-09-06 17:23:15.713445+00	20260906172315_add_product_domain	\N	\N	2026-09-06 17:23:15.35776+00	1
fb8d2ccd-17a7-48a2-88fa-93a088324a06	066a853134656d33c5f0159406f6b89359cccdee094a77eb7efc607c74171615	2026-09-11 07:38:39.306651+00	20260911073838_combo_item_variant	\N	\N	2026-09-11 07:38:38.838799+00	1
2df69c89-57b7-4a1c-a12b-736dd64749dd	f9a8f0a75aac259247085bcaf1efa5cda40ec60ea696f6885caace03c60fd4d0	2026-09-11 10:23:42.433229+00	20260911102341_add_cart	\N	\N	2026-09-11 10:23:41.944967+00	1
f6363cb2-cd30-4f92-b4d8-3af70af38a37	1fe2a6fcf951938c044cd416b2b392f9aec9b219289d7f63194553f16665d0de	2026-09-15 04:52:34.335285+00	20260915045233_add_google_auth	\N	\N	2026-09-15 04:52:34.082408+00	1
7a1e8948-5c22-421b-a8c1-aec777582290	005f7dc1cf6d42089a3bfd050a4ec72354819afd4a97edba9a235b7e3ccf9fa1	2026-09-11 13:26:16.163371+00	20260911132614_add_order	\N	\N	2026-09-11 13:26:15.417266+00	1
980b3a3a-cf6e-4a8b-b8ad-51123efc98aa	3aa758f5f31abcd0fe55c82c658013b1b8131f2512a65faa6406a46ef8ae85fa	2026-09-13 08:37:36.578436+00	20260913083736_add_serial	\N	\N	2026-09-13 08:37:36.291415+00	1
7237e390-d612-4412-9495-1358da010932	d3d45894f5e95e0a4b3611a052da016ce20ca34be4910a34d45284674c6c10b7	2026-09-13 09:00:51.293039+00	20260913090050_add_serial_owner	\N	\N	2026-09-13 09:00:51.022448+00	1
ac1de3c3-e521-4670-b7c1-86c86f93b228	eab8a223d593bededcf8610b46713ec4dda21964f151c6cacd0f4da84540358a	2026-09-19 06:27:04.652362+00	20260919062704_add_user_consent	\N	\N	2026-09-19 06:27:04.374766+00	1
e8144451-2815-4084-b730-8d8945d2faf4	7c7da9eeef88e351cb07b6a545a28054cec79e25da6927b24019c05f24bb943e	2026-09-13 10:08:26.967602+00	20260913100826_add_serial_order	\N	\N	2026-09-13 10:08:26.704553+00	1
0800006f-5960-41b8-a145-2fb2650d73d2	58389aead5166fa1dfeb6c90989e405da3eed015beef0a308283e9aa383a3780	2026-09-13 10:33:34.461098+00	20260913103333_add_question	\N	\N	2026-09-13 10:33:34.161893+00	1
e5cd4d09-dd20-4c3f-a556-1b3c242bca20	398e05085b9f9f0a546a257b3b8d79665e523941c7cda20777877cda82799f9b	2026-09-13 11:00:44.19679+00	20260913110043_add_review	\N	\N	2026-09-13 11:00:43.908687+00	1
34e9eb28-ba0a-4c8a-aab9-7afce7db9372	cee6da162527ba97c84cbc0d8be2eb6ad4b6c0c1bcbc9d62d445767ce1a1c941	2026-09-19 15:16:38.965048+00	20260919151638_add_order_status_history	\N	\N	2026-09-19 15:16:38.601584+00	1
047273a8-838c-4cad-8fa0-07cb55640e38	6c0e051a3e2f87139285998291c9c8ade56c1c6a26f2136af3a16a8d2f7a9f15	2026-09-13 12:24:26.067575+00	20260913122425_add_user_event	\N	\N	2026-09-13 12:24:25.809985+00	1
54850193-fc5d-4d10-841d-f76e1abd64c7	c05096256277917a8ba7a61ea0cc05c9783d4b790809867469afe1424d664f3e	2026-09-20 11:40:15.956176+00	20260920114015_add_support_ticket	\N	\N	2026-09-20 11:40:15.653034+00	1
07317e21-742f-413f-aab8-0d3ff232f055	8af62d4b535fa6ab07a02252b2594144c1e64fd5cd0ab97ed12ab6518245723b	2026-09-20 12:32:31.97725+00	20260920123231_add_support_attachments	\N	\N	2026-09-20 12:32:31.711964+00	1
bdda39de-5aff-4e54-93be-e2c684b630f5	10863b3f1b99bc338850eb386ab138b13706dba6d5b0c576bb3bfe4d01420380	2026-09-21 17:43:54.708891+00	20260921174354_add_review_moderation	\N	\N	2026-09-21 17:43:54.430848+00	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_logs (id, "actorId", "actorEmail", role, action, entity, "entityId", method, path, summary, "statusCode", "ipAddress", "userAgent", metadata, "createdAt") FROM stdin;
221ed01c-0c73-427b-888e-4958c03f5774	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	CREATE	CATEGORY	ecc4d638-3510-4ff5-b9fe-4c0da9062255	POST	/categories	CREATE CATEGORY	201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	{"icon": "Cpu", "name": "Arduino", "parentId": "ab4bd3d5-121e-42fe-8892-1002cfbc11dc", "sortOrder": 0}	2026-09-13 14:48:46.517
1c4fe56a-dd4f-45ee-aafd-004b704a8289	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	UPDATE	PRODUCT	86ae9777-0da8-4bce-94ac-1371c1792a98	PATCH	/products/86ae9777-0da8-4bce-94ac-1371c1792a98	UPDATE PRODUCT	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	{"name": "Bộ Ardruino", "price": 254000, "status": "ACTIVE", "brandId": "adec876b-507b-4b46-b60e-8a7d591c6fee", "salePrice": 234000, "categoryId": "ecc4d638-3510-4ff5-b9fe-4c0da9062255", "stockQuantity": 43}	2026-09-13 14:49:02.502
90d4ade2-1837-407d-8c67-e07785d7f227	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	ORDER	9dc16dd1-4105-45ea-b44b-0595cbc15917	PATCH	/admin/orders/9dc16dd1-4105-45ea-b44b-0595cbc15917/status	STATUS_CHANGE ORDER (DHMTXA1PJSYM95)	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	{"status": "COMPLETED"}	2026-09-13 15:36:55.991
59fd2795-f25a-476b-aaf4-7ed8d28d76d2	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	CREATE	REVIEW	0ddedb5f-d988-44a6-bed4-1f3801617c17	POST	/products/7176b1aa-f379-46af-89c6-67b7eb8a143c/reviews	CREATE REVIEW	201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	{"rating": 5, "comment": "Sản phẩm tốt, chất lượng"}	2026-09-13 15:42:30.972
ceda36b8-bd1b-49a8-bdfc-314ce4d27919	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	APPROVE	REVIEW	0ddedb5f-d988-44a6-bed4-1f3801617c17	PATCH	/admin/reviews/0ddedb5f-d988-44a6-bed4-1f3801617c17/status	APPROVE REVIEW	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	{"status": "APPROVED"}	2026-09-13 15:45:58.589
fd7b9ceb-52ab-48f3-82c4-d76cceacb524	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	{"note": "", "phone": "0396205536", "address": "Ngõ 256", "paymentMethod": "VNPAY", "recipientName": "Quản trị viên"}	2026-09-14 07:08:55.403
8754602a-0f27-434d-94de-bbabc561c8cb	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	ORDER	c44112c9-b2f4-452e-97e2-fbea43a03507	PATCH	/admin/orders/c44112c9-b2f4-452e-97e2-fbea43a03507/status	STATUS_CHANGE ORDER (DHMU0WJF4G4CMQ)	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	{"status": "SHIPPING"}	2026-09-14 07:24:25.305
e42ce8f0-9cbb-412c-bbda-7b753627eb04	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	ORDER	c44112c9-b2f4-452e-97e2-fbea43a03507	PATCH	/admin/orders/c44112c9-b2f4-452e-97e2-fbea43a03507/status	STATUS_CHANGE ORDER (DHMU0WJF4G4CMQ)	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	{"status": "COMPLETED"}	2026-09-14 07:24:28.904
0234a25b-5705-4095-9624-336165ce5af2	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	{"note": "", "phone": "0396205536", "address": "Xuân Hồng, Nam Định", "paymentMethod": "VNPAY", "recipientName": "Quản trị viên"}	2026-09-14 07:25:44.733
7f603d69-224d-48ad-ba1e-1e4a6db0a654	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	ORDER	37b89dea-40c4-4b95-9114-bfdc2a43c6f6	PATCH	/admin/orders/37b89dea-40c4-4b95-9114-bfdc2a43c6f6/status	STATUS_CHANGE ORDER (DHMU0X51OGP13L)	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"status": "CONFIRMED"}	2026-09-19 17:49:35.661
29103b57-32d9-49df-8915-dab6fe482a60	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	CREATE	OTHER	c082d10f-a98a-474f-8147-c29be8a4b525	POST	/support/tickets	CREATE OTHER (YCMU9S19H5JRO)	201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"type": "RETURN", "message": "Không đúng yêu cầu", "orderId": "c44112c9-b2f4-452e-97e2-fbea43a03507", "subject": "Đổi / Trả hàng - đơn DHMU0WJF4G4CMQ"}	2026-09-20 12:12:44.771
99cb23f3-fd3b-4bf8-85a7-a4c3a5ecd64e	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	CREATE	OTHER	c082d10f-a98a-474f-8147-c29be8a4b525	POST	/admin/support/tickets/c082d10f-a98a-474f-8147-c29be8a4b525/messages	CREATE OTHER (YCMU9S19H5JRO)	201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"message": "Shop sẽ hỗ trợ đổi ạ"}	2026-09-20 12:13:40.629
70f9723d-3d55-401c-9900-fc00503ab06a	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	OTHER	c082d10f-a98a-474f-8147-c29be8a4b525	PATCH	/admin/support/tickets/c082d10f-a98a-474f-8147-c29be8a4b525/status	STATUS_CHANGE OTHER (YCMU9S19H5JRO)	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"status": "RESOLVED"}	2026-09-20 12:58:57.796
01239dd1-c7b9-4dc9-a75f-81fda296130e	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	OTHER	c082d10f-a98a-474f-8147-c29be8a4b525	PATCH	/admin/support/tickets/c082d10f-a98a-474f-8147-c29be8a4b525/status	STATUS_CHANGE OTHER (YCMU9S19H5JRO)	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"status": "IN_PROGRESS"}	2026-09-20 12:59:01.352
d37e2a9b-686d-4439-9fd0-4bc56c1c2142	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	CREATE	REVIEW	7176b1aa-f379-46af-89c6-67b7eb8a143c	POST	/products/7176b1aa-f379-46af-89c6-67b7eb8a143c/reviews	CREATE REVIEW	400	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"rating": 5, "comment": "Tốt nha"}	2026-09-21 18:00:53.867
58848534-5b86-4176-a74e-d0b330524351	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	CREATE	REVIEW	7176b1aa-f379-46af-89c6-67b7eb8a143c	POST	/products/7176b1aa-f379-46af-89c6-67b7eb8a143c/reviews	CREATE REVIEW	400	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"rating": 5, "comment": "tốt nha"}	2026-09-21 18:01:06.773
e16c6fb0-46e7-4294-95f7-8de791f44c6b	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"note": "", "phone": "0396205536", "address": "Ngõ 256", "paymentMethod": "COD", "recipientName": "Quản trị viên"}	2026-09-21 18:01:54.051
271de989-09a9-45b6-9109-8f9a7abcb629	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	ORDER	1b67306b-a97d-4521-8d21-5abc4c82c1ee	PATCH	/admin/orders/1b67306b-a97d-4521-8d21-5abc4c82c1ee/status	STATUS_CHANGE ORDER (DHMUBJY4OFHQLF)	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"status": "CONFIRMED"}	2026-09-21 18:02:10.863
b4ee26a2-6aaf-4563-80bf-b713249d6526	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	ORDER	1b67306b-a97d-4521-8d21-5abc4c82c1ee	PATCH	/admin/orders/1b67306b-a97d-4521-8d21-5abc4c82c1ee/status	STATUS_CHANGE ORDER (DHMUBJY4OFHQLF)	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"status": "SHIPPING"}	2026-09-21 18:02:12.439
881dde1b-a3e4-4f15-8c43-4dd5b6f525e2	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	ORDER	1b67306b-a97d-4521-8d21-5abc4c82c1ee	PATCH	/admin/orders/1b67306b-a97d-4521-8d21-5abc4c82c1ee/status	STATUS_CHANGE ORDER (DHMUBJY4OFHQLF)	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"status": "COMPLETED"}	2026-09-21 18:02:14.5
c3fdc3d7-3845-4707-b045-f8d6cf13e6f1	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	CREATE	REVIEW	86cbcf5d-4406-4221-8bd7-8f38ff86f1fb	POST	/products/8ccc0a6f-d310-461d-97cf-9014d4125124/reviews	CREATE REVIEW	201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"rating": 5, "comment": "tốt nha"}	2026-09-21 18:02:51.269
36bdccdf-5da2-43c0-bbe7-4ce53230710b	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	REVIEW_DELETED	REVIEW	86cbcf5d-4406-4221-8bd7-8f38ff86f1fb	DELETE	/admin/reviews/86cbcf5d-4406-4221-8bd7-8f38ff86f1fb	Xoá đánh giá (FAKE)	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"reason": "FAKE"}	2026-09-21 18:03:19.314
528ae4b1-e500-4a99-9f99-f430cab7ee84	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	DELETE	REVIEW	86cbcf5d-4406-4221-8bd7-8f38ff86f1fb	DELETE	/admin/reviews/86cbcf5d-4406-4221-8bd7-8f38ff86f1fb	DELETE REVIEW	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"reason": "FAKE"}	2026-09-21 18:03:19.314
72598f95-df6f-4c0b-a204-8c07ab81bb2e	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	CREATE	REVIEW	db23c0a1-2317-4ea4-9ed2-aca87666fb91	POST	/products/8ccc0a6f-d310-461d-97cf-9014d4125124/reviews	CREATE REVIEW	201	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"rating": 5, "comment": "tốt nha"}	2026-09-21 18:04:30.201
684fd244-2426-4865-8d9a-3485c2b8a949	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	APPROVE	REVIEW	db23c0a1-2317-4ea4-9ed2-aca87666fb91	PATCH	/admin/reviews/db23c0a1-2317-4ea4-9ed2-aca87666fb91/status	APPROVE REVIEW	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"status": "APPROVED"}	2026-09-21 18:04:38.445
55c0cb5f-0e52-4d13-a680-18a45fb67972	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	LOGIN	AUTH	\N	POST	/auth/login	Đăng nhập	200	::1	curl/8.15.0	\N	2026-09-21 18:18:56.063
bb2afe38-9d6d-4a37-9da0-dbc78062f678	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	LOGIN	AUTH	\N	POST	/auth/login	Đăng nhập	200	::1	Python-urllib/3.13	\N	2026-09-21 18:22:03.906
0e72f7a6-e5ad-425f-9a93-fa4c6e337394	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	LOGIN	AUTH	\N	POST	/auth/login	Đăng nhập	200	::1	Python-urllib/3.13	\N	2026-09-21 18:22:20.53
bd2059a9-df7d-461d-9a09-2ed01b034531	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	LOGIN	AUTH	\N	POST	/auth/login	Đăng nhập	200	::1	Python-urllib/3.13	\N	2026-09-21 18:22:21.382
d5a978ff-7bd5-4ef3-b4e5-c188d2e28872	\N	admin@tmdt-iot.local	\N	LOGIN_FAILED	AUTH	\N	POST	/auth/login	Đăng nhập thất bại	401	::1	Python-urllib/3.13	\N	2026-09-21 18:22:21.535
972ef7a9-d3f6-43a7-95c4-1a5f3b7d5898	\N	khongtontai@x.com	\N	LOGIN_FAILED	AUTH	\N	POST	/auth/login	Đăng nhập thất bại	401	::1	Python-urllib/3.13	\N	2026-09-21 18:22:21.606
a3600203-66b4-4010-88fd-d4b51b079583	1469b870-c9e6-4070-966f-128967cb3ee6	tc_1790014941@example.com	CUSTOMER	REGISTER	AUTH	\N	POST	/auth/register	Đăng ký tài khoản	201	::1	Python-urllib/3.13	\N	2026-09-21 18:22:22.279
4d86cf33-120b-421f-8bac-f1f2f72dcc32	24f017bf-122f-474d-aaa2-c11a2052db51	tc2_1790014941@example.com	CUSTOMER	REGISTER	AUTH	\N	POST	/auth/register	Đăng ký tài khoản	201	::1	Python-urllib/3.13	\N	2026-09-21 18:22:22.977
f4574913-9c25-4501-aa67-d3680efe61c4	1469b870-c9e6-4070-966f-128967cb3ee6	tc_1790014941@example.com	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	400	::1	Python-urllib/3.13	{"phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:22:25.374
7bd851d9-495d-4a3c-ab8b-a7641fc0c511	1469b870-c9e6-4070-966f-128967cb3ee6	tc_1790014941@example.com	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	201	::1	Python-urllib/3.13	{"phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:22:28.37
1e81ffad-8921-4f77-a0cd-473cc72fd22f	1469b870-c9e6-4070-966f-128967cb3ee6	tc_1790014941@example.com	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	400	::1	Python-urllib/3.13	{"note": "Ca kiểm thử", "phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:22:28.785
52216a45-0d50-4b5f-b408-2c08330f00bd	1469b870-c9e6-4070-966f-128967cb3ee6	tc_1790014941@example.com	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	400	::1	Python-urllib/3.13	{"phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:22:29.13
5874d411-b6d8-4d1f-b180-db6b1bcbe580	1469b870-c9e6-4070-966f-128967cb3ee6	tc_1790014941@example.com	CUSTOMER	CREATE	REVIEW	7176b1aa-f379-46af-89c6-67b7eb8a143c	POST	/products/7176b1aa-f379-46af-89c6-67b7eb8a143c/reviews	CREATE REVIEW	400	::1	Python-urllib/3.13	{"rating": 5, "comment": "Test chưa mua"}	2026-09-21 18:22:29.408
8ea7000e-68c9-4f29-8312-327982a537cb	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	REJECT	REVIEW	db23c0a1-2317-4ea4-9ed2-aca87666fb91	PATCH	/admin/reviews/db23c0a1-2317-4ea4-9ed2-aca87666fb91/status	REJECT REVIEW	400	::1	Python-urllib/3.13	{"status": "REJECTED"}	2026-09-21 18:22:30.377
af09419d-0b44-47c1-8123-b5d54eeabed3	1469b870-c9e6-4070-966f-128967cb3ee6	tc_1790014941@example.com	CUSTOMER	CREATE	OTHER	7c5e439f-61e7-44db-9f3b-2c96f18915b7	POST	/support/tickets	CREATE OTHER (YCMUBKONCFAI3)	201	::1	Python-urllib/3.13	{"type": "GENERAL", "message": "Nội dung kiểm thử tối thiểu.", "subject": "Ca kiểm thử hỗ trợ"}	2026-09-21 18:22:31.165
22541495-104b-46bd-9eae-a32ed2991e40	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CANCEL_ORDER	ORDER	33619eb4-568d-4509-b557-681868fd63be	PATCH	/orders/33619eb4-568d-4509-b557-681868fd63be/cancel	CANCEL_ORDER ORDER (DHMUBKY2VS19JN)	200	::1	Python-urllib/3.13	\N	2026-09-21 18:29:52.374
0d00ab0c-0b6d-4d66-a434-370dd55721d7	1469b870-c9e6-4070-966f-128967cb3ee6	tc_1790014941@example.com	CUSTOMER	CREATE	OTHER	\N	POST	/support/tickets	CREATE OTHER	404	::1	Python-urllib/3.13	{"type": "RETURN", "message": "Thử gắn đơn không thuộc mình.", "orderId": "00000000-0000-0000-0000-000000000000", "subject": "Gắn đơn lạ"}	2026-09-21 18:22:31.333
172dc779-f9a4-4648-a1d8-48ffe13657fc	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	CREATE	OTHER	7c5e439f-61e7-44db-9f3b-2c96f18915b7	POST	/admin/support/tickets/7c5e439f-61e7-44db-9f3b-2c96f18915b7/messages	CREATE OTHER (YCMUBKONCFAI3)	201	::1	Python-urllib/3.13	{"message": "Chào bạn, chúng tôi đã tiếp nhận."}	2026-09-21 18:22:32.162
fd819351-6d59-4e78-8447-0e6b415c5334	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	LOGIN	AUTH	\N	POST	/auth/login	Đăng nhập	200	::1	Python-urllib/3.13	\N	2026-09-21 18:26:54.266
7ceb869b-9dd1-4207-a22d-47771c9d5d47	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	LOGIN	AUTH	\N	POST	/auth/login	Đăng nhập	200	::1	Python-urllib/3.13	\N	2026-09-21 18:26:54.602
1025a6b8-8210-47eb-b4e8-1147e20bd0af	\N	admin@tmdt-iot.local	\N	LOGIN_FAILED	AUTH	\N	POST	/auth/login	Đăng nhập thất bại	401	::1	Python-urllib/3.13	\N	2026-09-21 18:26:54.753
8754b9a8-9f5e-4a01-b469-12b10d96c3e7	\N	khong-ton-tai@x.com	\N	LOGIN_FAILED	AUTH	\N	POST	/auth/login	Đăng nhập thất bại	401	::1	Python-urllib/3.13	\N	2026-09-21 18:26:54.832
d39888b1-b35d-401d-be3d-6a2d2a07ccde	\N	admin@tmdt-iot.local	\N	LOGIN_FAILED	AUTH	\N	POST	/auth/login	Đăng nhập thất bại	401	::1	Python-urllib/3.13	\N	2026-09-21 18:26:54.979
7f5a0db2-5643-4c8d-9901-8652f5987951	ccf43871-75a3-42f5-9a02-2873bbe08344	tc_1790015214@example.com	CUSTOMER	REGISTER	AUTH	\N	POST	/auth/register	Đăng ký tài khoản	201	::1	Python-urllib/3.13	\N	2026-09-21 18:26:55.524
c475ff99-7498-4539-bd6e-3d64cbce9f2d	7fc3a067-7600-4368-8d57-e74000814791	tc2_1790015214@example.com	CUSTOMER	REGISTER	AUTH	\N	POST	/auth/register	Đăng ký tài khoản	201	::1	Python-urllib/3.13	\N	2026-09-21 18:26:56.172
56478e37-1a1b-414c-9baf-ea15e6d03a29	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	400	::1	Python-urllib/3.13	{"phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:26:59.724
40817828-e7ad-40a7-920e-9e8c321bc682	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	400	::1	Python-urllib/3.13	{"phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:27:00.434
e7bf683b-19f6-4acf-bd4f-6aa401b23137	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	400	::1	Python-urllib/3.13	{"note": "Ca kiểm thử", "phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:27:00.592
d86500ff-340e-4808-acfd-53980ae53bc8	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	400	::1	Python-urllib/3.13	{"phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:27:01.046
a5d82718-5a49-4635-9ff4-aceb7a07c28e	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CREATE	REVIEW	86ae9777-0da8-4bce-94ac-1371c1792a98	POST	/products/86ae9777-0da8-4bce-94ac-1371c1792a98/reviews	CREATE REVIEW	400	::1	Python-urllib/3.13	{"rating": 5, "comment": "Test chưa mua"}	2026-09-21 18:27:01.202
c15d0aed-887d-4dbc-82a2-01fc9ff39de1	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	REJECT	REVIEW	db23c0a1-2317-4ea4-9ed2-aca87666fb91	PATCH	/admin/reviews/db23c0a1-2317-4ea4-9ed2-aca87666fb91/status	REJECT REVIEW	400	::1	Python-urllib/3.13	{"status": "REJECTED"}	2026-09-21 18:27:01.769
dcec97a2-4575-492c-80e7-c4f215955268	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CREATE	OTHER	d785f395-99b3-4703-af14-2eb571c1b631	POST	/support/tickets	CREATE OTHER (YCMUBKUGRAF5F)	201	::1	Python-urllib/3.13	{"type": "GENERAL", "message": "Nội dung kiểm thử tối thiểu.", "subject": "Ca kiểm thử hỗ trợ"}	2026-09-21 18:27:02.249
1985cd03-942f-438f-ae17-1ed2c9f57b35	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CREATE	OTHER	\N	POST	/support/tickets	CREATE OTHER	404	::1	Python-urllib/3.13	{"type": "RETURN", "message": "Thử gắn đơn không thuộc mình.", "orderId": "00000000-0000-0000-0000-000000000000", "subject": "Gắn đơn lạ"}	2026-09-21 18:27:02.367
a3e901e5-6724-434a-ba3b-2c0784531c4a	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	CREATE	OTHER	d785f395-99b3-4703-af14-2eb571c1b631	POST	/admin/support/tickets/d785f395-99b3-4703-af14-2eb571c1b631/messages	CREATE OTHER (YCMUBKUGRAF5F)	201	::1	Python-urllib/3.13	{"message": "Chào bạn, chúng tôi đã tiếp nhận yêu cầu."}	2026-09-21 18:27:02.892
301b48e9-4643-4602-bb48-28c937ea3d54	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	LOGIN	AUTH	\N	POST	/auth/login	Đăng nhập	200	::1	Python-urllib/3.13	\N	2026-09-21 18:29:41.561
092ff920-bcdd-4ae3-8212-3d1313da6a27	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	LOGIN	AUTH	\N	POST	/auth/login	Đăng nhập	200	::1	Python-urllib/3.13	\N	2026-09-21 18:29:42.058
081651c6-f284-434c-8bfe-9c2af6d9aff5	\N	admin@tmdt-iot.local	\N	LOGIN_FAILED	AUTH	\N	POST	/auth/login	Đăng nhập thất bại	401	::1	Python-urllib/3.13	\N	2026-09-21 18:29:42.194
4ef6ee2f-9583-4140-9a06-bc7560ae35a0	\N	khong-ton-tai@x.com	\N	LOGIN_FAILED	AUTH	\N	POST	/auth/login	Đăng nhập thất bại	401	::1	Python-urllib/3.13	\N	2026-09-21 18:29:42.265
9b568633-e69d-4a09-bcfa-f4c67e544e6f	\N	admin@tmdt-iot.local	\N	LOGIN_FAILED	AUTH	\N	POST	/auth/login	Đăng nhập thất bại	401	::1	Python-urllib/3.13	\N	2026-09-21 18:29:42.412
567972cd-b186-4e85-b78a-bbf83099f8b2	dda42665-5669-4f68-b19b-4b12dd47b239	tc_1790015382@example.com	CUSTOMER	REGISTER	AUTH	\N	POST	/auth/register	Đăng ký tài khoản	201	::1	Python-urllib/3.13	\N	2026-09-21 18:29:43.04
94fe2904-ce71-4bc9-8c04-c6f0078c8985	d64ae77e-a9ce-4205-8c25-ad03a378a36c	tc2_1790015382@example.com	CUSTOMER	REGISTER	AUTH	\N	POST	/auth/register	Đăng ký tài khoản	201	::1	Python-urllib/3.13	\N	2026-09-21 18:29:43.737
8c1cf7ad-28a3-49ae-a339-f7aa2a845032	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	400	::1	Python-urllib/3.13	{"phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:29:47.949
14ff8769-24b7-48e3-8129-dc2760fa898d	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	201	::1	Python-urllib/3.13	{"note": "Ca kiểm thử", "phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:29:51.279
79836d71-32d5-45f5-81b7-dbcf60998106	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CANCEL_ORDER	ORDER	33619eb4-568d-4509-b557-681868fd63be	PATCH	/orders/33619eb4-568d-4509-b557-681868fd63be/cancel	CANCEL_ORDER ORDER	400	::1	Python-urllib/3.13	\N	2026-09-21 18:29:52.604
bdbacfee-7a2e-4b64-bfe8-f62d46d3c12b	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	201	::1	Python-urllib/3.13	{"note": "Ca kiểm thử", "phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:29:55.118
48b7cf1c-b3a5-4e64-bdf0-cadf7bdcc14c	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	ORDER	be0926bb-3ab3-4f2b-94d1-d248551f3cf4	PATCH	/admin/orders/be0926bb-3ab3-4f2b-94d1-d248551f3cf4/status	STATUS_CHANGE ORDER	400	::1	Python-urllib/3.13	{"status": "COMPLETED"}	2026-09-21 18:29:55.343
4dc9b183-17ba-4d05-a2bc-3abf218286e7	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	ORDER	be0926bb-3ab3-4f2b-94d1-d248551f3cf4	PATCH	/admin/orders/be0926bb-3ab3-4f2b-94d1-d248551f3cf4/status	STATUS_CHANGE ORDER (DHMUBKY5WGVBAL)	200	::1	Python-urllib/3.13	{"status": "CONFIRMED"}	2026-09-21 18:29:56.044
6b127cc0-2255-4419-88ff-2c99010d6cd5	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CREATE	REVIEW	7176b1aa-f379-46af-89c6-67b7eb8a143c	POST	/products/7176b1aa-f379-46af-89c6-67b7eb8a143c/reviews	CREATE REVIEW	400	::1	Python-urllib/3.13	{"rating": 5, "comment": "Test chưa mua"}	2026-09-21 18:29:56.36
419a3570-2de9-46bd-89d3-ad2047c929ce	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	REJECT	REVIEW	db23c0a1-2317-4ea4-9ed2-aca87666fb91	PATCH	/admin/reviews/db23c0a1-2317-4ea4-9ed2-aca87666fb91/status	REJECT REVIEW	400	::1	Python-urllib/3.13	{"status": "REJECTED"}	2026-09-21 18:29:57.355
a7113db4-c4b6-496b-98ca-9ac3c1ad3b3e	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CREATE	OTHER	d7b8ec0a-996e-4194-a870-d1c825f9c1ae	POST	/support/tickets	CREATE OTHER (YCMUBKY88H8W3)	201	::1	Python-urllib/3.13	{"type": "GENERAL", "message": "Nội dung kiểm thử tối thiểu.", "subject": "Ca kiểm thử hỗ trợ"}	2026-09-21 18:29:58.137
b81352aa-e240-4dd4-9cfd-c2607e5a46d8	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CREATE	OTHER	\N	POST	/support/tickets	CREATE OTHER	404	::1	Python-urllib/3.13	{"type": "RETURN", "message": "Thử gắn đơn không thuộc mình.", "orderId": "00000000-0000-0000-0000-000000000000", "subject": "Gắn đơn lạ"}	2026-09-21 18:29:58.31
78f3a3f0-424c-43a7-a8c3-28bc8d607117	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	CREATE	OTHER	d7b8ec0a-996e-4194-a870-d1c825f9c1ae	POST	/admin/support/tickets/d7b8ec0a-996e-4194-a870-d1c825f9c1ae/messages	CREATE OTHER (YCMUBKY88H8W3)	201	::1	Python-urllib/3.13	{"message": "Chào bạn, chúng tôi đã tiếp nhận yêu cầu."}	2026-09-21 18:29:59.145
58b475cc-3824-41be-84ac-d96e198b0241	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	UPDATE	PRODUCT	7176b1aa-f379-46af-89c6-67b7eb8a143c	PATCH	/products/7176b1aa-f379-46af-89c6-67b7eb8a143c	UPDATE PRODUCT	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	{"name": "Cảm biến Photoresistor", "price": 15000, "status": "ACTIVE", "brandId": "adec876b-507b-4b46-b60e-8a7d591c6fee", "salePrice": 8000, "categoryId": "aa3543d4-0c25-4d49-ad38-0513c3bdc40f", "description": "Cảm biến Photoresistor chất lượng cao", "stockQuantity": 85}	2026-09-21 18:33:08.945
daa84106-e32f-489b-b10d-eaaa8dd05a84	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	LOGIN	AUTH	\N	POST	/auth/login	Đăng nhập	200	::1	Python-urllib/3.13	\N	2026-09-21 18:37:55.535
d7d5124e-da0e-421f-9498-be63b1deafea	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	LOGIN	AUTH	\N	POST	/auth/login	Đăng nhập	200	::1	Python-urllib/3.13	\N	2026-09-21 18:37:56.421
a25c0515-e019-4ce1-8594-5e7a2749bc2a	\N	admin@tmdt-iot.local	\N	LOGIN_FAILED	AUTH	\N	POST	/auth/login	Đăng nhập thất bại	401	::1	Python-urllib/3.13	\N	2026-09-21 18:37:56.6
17f2bf5a-c73e-4d8c-8dd6-e961bdf0b5f4	\N	khong-ton-tai@x.com	\N	LOGIN_FAILED	AUTH	\N	POST	/auth/login	Đăng nhập thất bại	401	::1	Python-urllib/3.13	\N	2026-09-21 18:37:56.657
5a05a423-1de8-4d6b-b8e4-436355429439	\N	admin@tmdt-iot.local	\N	LOGIN_FAILED	AUTH	\N	POST	/auth/login	Đăng nhập thất bại	401	::1	Python-urllib/3.13	\N	2026-09-21 18:37:56.838
04b27378-9fe4-431a-bda5-30717040890a	8be33304-d392-4966-876f-c540487ec66e	tc_1790015876@example.com	CUSTOMER	REGISTER	AUTH	\N	POST	/auth/register	Đăng ký tài khoản	201	::1	Python-urllib/3.13	\N	2026-09-21 18:37:57.588
96e0cc40-63f0-4c76-b231-34bb663cb49d	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	400	::1	Python-urllib/3.13	{"phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:38:02.024
2f113df1-60d3-4a67-862a-4c2a1e2d032a	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	201	::1	Python-urllib/3.13	{"note": "Ca kiểm thử", "phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:38:05.154
00d7d3d6-a58e-435e-920d-23f0270c3dfb	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CANCEL_ORDER	ORDER	f0638284-8169-4e76-b457-e3f512be0201	PATCH	/orders/f0638284-8169-4e76-b457-e3f512be0201/cancel	CANCEL_ORDER ORDER (DHMUBL8NYL9AB4)	200	::1	Python-urllib/3.13	\N	2026-09-21 18:38:06.272
f25f8585-e71a-4091-a27d-d5de0cbc077e	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CANCEL_ORDER	ORDER	f0638284-8169-4e76-b457-e3f512be0201	PATCH	/orders/f0638284-8169-4e76-b457-e3f512be0201/cancel	CANCEL_ORDER ORDER	400	::1	Python-urllib/3.13	\N	2026-09-21 18:38:06.489
183dcac0-453e-441f-8fa7-a5a46692eb70	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	PLACE_ORDER	ORDER	\N	POST	/orders	PLACE_ORDER ORDER	201	::1	Python-urllib/3.13	{"note": "Ca kiểm thử", "phone": "0901234567", "address": "12 Đường ABC, Q1, TP.HCM", "paymentMethod": "COD", "recipientName": "Khách Demo"}	2026-09-21 18:38:09.166
6bffff03-17f3-42d8-a3d1-80bc61817b6f	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	ORDER	0430668b-76aa-4228-b2a5-6f2009d9efa2	PATCH	/admin/orders/0430668b-76aa-4228-b2a5-6f2009d9efa2/status	STATUS_CHANGE ORDER	400	::1	Python-urllib/3.13	{"status": "COMPLETED"}	2026-09-21 18:38:09.369
7c917750-29d5-4e4c-b4b5-6a3b4ecbfd9b	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	STATUS_CHANGE	ORDER	0430668b-76aa-4228-b2a5-6f2009d9efa2	PATCH	/admin/orders/0430668b-76aa-4228-b2a5-6f2009d9efa2/status	STATUS_CHANGE ORDER (DHMUBL8R1CBA0D)	200	::1	Python-urllib/3.13	{"status": "CONFIRMED"}	2026-09-21 18:38:10.131
6c1a476c-cb28-4ac1-9293-89ed4bfeb4a3	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CREATE	REVIEW	86ae9777-0da8-4bce-94ac-1371c1792a98	POST	/products/86ae9777-0da8-4bce-94ac-1371c1792a98/reviews	CREATE REVIEW	400	::1	Python-urllib/3.13	{"rating": 5, "comment": "Test chưa mua"}	2026-09-21 18:38:10.415
7f2b4aaf-275b-477d-b891-14e614efd05d	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	REJECT	REVIEW	db23c0a1-2317-4ea4-9ed2-aca87666fb91	PATCH	/admin/reviews/db23c0a1-2317-4ea4-9ed2-aca87666fb91/status	REJECT REVIEW	400	::1	Python-urllib/3.13	{"status": "REJECTED"}	2026-09-21 18:38:11.299
64a0ab73-33d1-42e4-be98-5620145c18c7	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CREATE	OTHER	6c4ebb55-d1c8-4ab7-b68a-bd94ea79ee68	POST	/support/tickets	CREATE OTHER (YCMUBL8TED7JL)	201	::1	Python-urllib/3.13	{"type": "GENERAL", "message": "Nội dung kiểm thử tối thiểu.", "subject": "Ca kiểm thử hỗ trợ"}	2026-09-21 18:38:12.103
6f8d732d-341b-4223-84b4-85efb0588737	7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	CUSTOMER	CREATE	OTHER	\N	POST	/support/tickets	CREATE OTHER	404	::1	Python-urllib/3.13	{"type": "RETURN", "message": "Thử gắn đơn không thuộc mình.", "orderId": "00000000-0000-0000-0000-000000000000", "subject": "Gắn đơn lạ"}	2026-09-21 18:38:12.276
627e76c8-4272-40be-9ed1-17581e2e2add	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	CREATE	OTHER	6c4ebb55-d1c8-4ab7-b68a-bd94ea79ee68	POST	/admin/support/tickets/6c4ebb55-d1c8-4ab7-b68a-bd94ea79ee68/messages	CREATE OTHER (YCMUBL8TED7JL)	201	::1	Python-urllib/3.13	{"message": "Chào bạn, chúng tôi đã tiếp nhận yêu cầu."}	2026-09-21 18:38:13.075
e3c9b19a-5924-4724-be0d-6a0b6b80dc2c	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	LOGOUT	AUTH	\N	POST	/auth/logout	Đăng xuất	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	\N	2026-09-21 20:21:14.979
c23a956e-2c92-473d-b26e-3cfa95d14a8f	fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	ADMIN	LOGIN	AUTH	\N	POST	/auth/login	Đăng nhập	200	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	\N	2026-09-21 20:21:51.743
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.brands (id, name, slug, "logoUrl", "isActive", "createdAt", "updatedAt") FROM stdin;
adec876b-507b-4b46-b60e-8a7d591c6fee	Lumi	lumi	https://pub-e9fd99af5e5d44b982fde4d40ff91b50.r2.dev/brands/4541c396-858e-4341-ac0d-6e8b0796b986.png	t	2026-09-06 10:38:42.366	2026-09-08 12:06:15.515
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cart_items (id, "cartId", "productId", "variantId", quantity, "createdAt", "updatedAt") FROM stdin;
64c544ea-2b19-4ad3-9f97-de3bc8343b2c	d87b970a-f432-4de8-89f3-88901fc8ff2e	8ccc0a6f-d310-461d-97cf-9014d4125124	a0e71f05-e690-4aab-9ca6-09edfcfd8354	1	2026-09-21 20:23:14.451	2026-09-21 20:23:14.451
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.carts (id, "userId", "createdAt", "updatedAt") FROM stdin;
d87b970a-f432-4de8-89f3-88901fc8ff2e	fd461e68-f9a4-4734-9768-26d6943658cf	2026-09-11 11:04:46.722	2026-09-11 11:04:46.722
6f56d26a-7104-4c89-ac28-b65aad7f38c1	7d163a34-5384-4685-8d75-3e7f478f11da	2026-09-21 18:26:59.348	2026-09-21 18:26:59.348
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, "parentId", name, slug, description, icon, level, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
0eff2a89-fb15-4231-809d-4ed013294076	\N	Thiết bị	thiet-bi	\N	\N	1	0	t	2026-09-06 10:14:30.691	2026-09-06 10:14:30.691
c7b0618a-0423-4766-8f02-c2597614eb9b	0eff2a89-fb15-4231-809d-4ed013294076	Cảm biến	cam-bien	\N	Antenna	2	1	t	2026-09-06 10:15:01.883	2026-09-06 10:15:01.883
eec5e738-f182-4daf-a080-3dd66a3c321b	c7b0618a-0423-4766-8f02-c2597614eb9b	Cảm biến nhiệt độ	cam-bien-nhiet-do	\N	Thermometer	3	2	t	2026-09-06 10:15:35.044	2026-09-06 10:15:35.044
72cc78d4-2ee1-48fa-b933-6f9747a2d90f	c7b0618a-0423-4766-8f02-c2597614eb9b	Cảm biến nước	cam-bien-nuoc	\N	Antenna	3	0	t	2026-09-07 06:30:18.88	2026-09-07 06:30:18.88
aa3543d4-0c25-4d49-ad38-0513c3bdc40f	c7b0618a-0423-4766-8f02-c2597614eb9b	Cảm biến ánh sáng	cam-bien-anh-sang	\N	Sun	3	0	t	2026-09-07 06:30:52.155	2026-09-07 06:30:52.155
ab4bd3d5-121e-42fe-8892-1002cfbc11dc	\N	Kit	kit	\N	\N	1	0	t	2026-09-08 12:49:12.106	2026-09-08 12:49:12.106
ecc4d638-3510-4ff5-b9fe-4c0da9062255	ab4bd3d5-121e-42fe-8892-1002cfbc11dc	Arduino	arduino	\N	Cpu	2	0	t	2026-09-13 14:48:46.413	2026-09-13 14:48:46.413
\.


--
-- Data for Name: combo_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.combo_items (id, "comboId", "productId", quantity, "variantId") FROM stdin;
afaa0102-66ee-44b7-8bdf-34d6625ae05e	86ae9777-0da8-4bce-94ac-1371c1792a98	7176b1aa-f379-46af-89c6-67b7eb8a143c	1	\N
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.order_items (id, "orderId", "productId", "variantId", name, "variantLabel", image, "unitPrice", quantity, "lineTotal") FROM stdin;
61fd3c93-d2e1-4ad4-8a6d-f7a5c5c272a5	9dc16dd1-4105-45ea-b44b-0595cbc15917	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	Cảm biến Photoresistor	\N	https://pub-e9fd99af5e5d44b982fde4d40ff91b50.r2.dev/products/36a1a59d-c8b5-4088-a5f7-01e26f1281dc.jpg	8000	1	8000
49128a1a-2bc7-443e-968e-21f32f7377cc	c44112c9-b2f4-452e-97e2-fbea43a03507	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	Cảm biến Photoresistor	\N	https://pub-e9fd99af5e5d44b982fde4d40ff91b50.r2.dev/products/36a1a59d-c8b5-4088-a5f7-01e26f1281dc.jpg	8000	1	8000
3d269224-9bd2-4d66-a1c1-d4c24a020df6	37b89dea-40c4-4b95-9114-bfdc2a43c6f6	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	Cảm biến Photoresistor	\N	https://pub-e9fd99af5e5d44b982fde4d40ff91b50.r2.dev/products/36a1a59d-c8b5-4088-a5f7-01e26f1281dc.jpg	8000	1	8000
53269607-7b81-4772-9501-27c76a82327e	1b67306b-a97d-4521-8d21-5abc4c82c1ee	8ccc0a6f-d310-461d-97cf-9014d4125124	c072933b-4d33-4765-868c-2b0ad4ce217a	WAter DevKit V1 WiFi + Bluetooth	Màu: Đen	https://pub-e9fd99af5e5d44b982fde4d40ff91b50.r2.dev/products/bef4a252-6425-4d21-95fa-e5a9f03ec44c.jpg	139000	1	139000
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.order_status_history (id, "orderId", status, note, "changedBy", "createdAt") FROM stdin;
22ec2fce-1b1f-42dd-a2f5-498431c2bbc9	37b89dea-40c4-4b95-9114-bfdc2a43c6f6	CONFIRMED	\N	admin@tmdt-iot.local	2026-09-19 17:49:35.314
76123cc6-f0ca-466c-a73b-9c01bf8ac4c8	1b67306b-a97d-4521-8d21-5abc4c82c1ee	PENDING	Đơn hàng được tạo	Khách hàng	2026-09-21 18:01:53.598
f721a02d-7e0c-44cd-961c-fb46d013a37a	1b67306b-a97d-4521-8d21-5abc4c82c1ee	CONFIRMED	\N	admin@tmdt-iot.local	2026-09-21 18:02:10.49
0995bb8f-a318-4fd7-8b8e-c1f5325c1cd7	1b67306b-a97d-4521-8d21-5abc4c82c1ee	SHIPPING	\N	admin@tmdt-iot.local	2026-09-21 18:02:12.129
ab154db2-e388-481d-8539-f170d06f2ff6	1b67306b-a97d-4521-8d21-5abc4c82c1ee	COMPLETED	\N	admin@tmdt-iot.local	2026-09-21 18:02:14.199
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.orders (id, code, "userId", "recipientName", phone, address, note, subtotal, "shippingFee", total, status, "paymentMethod", "paymentStatus", "paidAt", "createdAt", "updatedAt") FROM stdin;
9dc16dd1-4105-45ea-b44b-0595cbc15917	DHMTXA1PJSYM95	fd461e68-f9a4-4734-9768-26d6943658cf	Quản trị viên	0396205536	Ngõ 256 Đặng Tiến Đông		8000	30000	38000	COMPLETED	VNPAY	PAID	2026-09-11 18:24:16.519	2026-09-11 18:15:57.594	2026-09-13 15:36:55.266
c44112c9-b2f4-452e-97e2-fbea43a03507	DHMU0WJF4G4CMQ	fd461e68-f9a4-4734-9768-26d6943658cf	Quản trị viên	0396205536	Ngõ 256		8000	30000	38000	COMPLETED	VNPAY	PAID	2026-09-14 07:10:54.17	2026-09-14 07:08:53.97	2026-09-14 07:24:27.705
37b89dea-40c4-4b95-9114-bfdc2a43c6f6	DHMU0X51OGP13L	fd461e68-f9a4-4734-9768-26d6943658cf	Quản trị viên	0396205536	Xuân Hồng, Nam Định		8000	30000	38000	CONFIRMED	VNPAY	FAILED	\N	2026-09-14 07:25:42.978	2026-09-19 17:49:35.217
1b67306b-a97d-4521-8d21-5abc4c82c1ee	DHMUBJY4OFHQLF	fd461e68-f9a4-4734-9768-26d6943658cf	Quản trị viên	0396205536	Ngõ 256		139000	30000	169000	COMPLETED	COD	PAID	2026-09-21 18:02:13.887	2026-09-21 18:01:53.202	2026-09-21 18:02:13.889
\.


--
-- Data for Name: product_attribute_options; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_attribute_options (id, "attributeId", value, "sortOrder") FROM stdin;
11204f96-9bf6-48cb-914c-ef82540537e4	4749f54b-d6c7-405e-beaf-c1f3cfa94312	Đen	0
550e8b43-b875-445d-8e6e-35faee547c34	4749f54b-d6c7-405e-beaf-c1f3cfa94312	Đỏ	1
\.


--
-- Data for Name: product_attributes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_attributes (id, "productId", name, "isVariant", "sortOrder") FROM stdin;
4749f54b-d6c7-405e-beaf-c1f3cfa94312	8ccc0a6f-d310-461d-97cf-9014d4125124	Màu	t	0
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_images (id, "productId", "imageUrl", "sortOrder", "isPrimary") FROM stdin;
546a6af2-1698-400e-9edc-8d3c26c9c94c	8ccc0a6f-d310-461d-97cf-9014d4125124	https://pub-e9fd99af5e5d44b982fde4d40ff91b50.r2.dev/products/e237d4cd-d963-482b-acd0-3b606042fb0e.jpg	0	f
bc47d17d-404f-4cf4-b08d-5b9d7385e45e	8ccc0a6f-d310-461d-97cf-9014d4125124	https://pub-e9fd99af5e5d44b982fde4d40ff91b50.r2.dev/products/3bb1b849-6054-43da-8a16-2e9c8c6215ee.webp	1	f
66c88386-0175-4a1b-9ba9-4cfc0ef315ff	8ccc0a6f-d310-461d-97cf-9014d4125124	https://pub-e9fd99af5e5d44b982fde4d40ff91b50.r2.dev/products/bef4a252-6425-4d21-95fa-e5a9f03ec44c.jpg	2	t
dc4e6646-1ee4-4896-8e14-ae29152a61bc	86ae9777-0da8-4bce-94ac-1371c1792a98	https://pub-e9fd99af5e5d44b982fde4d40ff91b50.r2.dev/products/5676888a-847f-4099-89e6-f90acf1c408e.jpg	0	t
85b1ba6f-2f2b-46e9-b0ad-350c5b5c6882	7176b1aa-f379-46af-89c6-67b7eb8a143c	https://pub-e9fd99af5e5d44b982fde4d40ff91b50.r2.dev/products/36a1a59d-c8b5-4088-a5f7-01e26f1281dc.jpg	0	t
733828f4-6e20-4b96-a856-d0c172dfce31	7176b1aa-f379-46af-89c6-67b7eb8a143c	https://pub-e9fd99af5e5d44b982fde4d40ff91b50.r2.dev/products/be15f074-a263-4176-a909-df9fca25dcfc.jpg	1	f
3379ec60-3ecf-429f-afc7-6a50cb1a7759	7176b1aa-f379-46af-89c6-67b7eb8a143c	https://pub-e9fd99af5e5d44b982fde4d40ff91b50.r2.dev/products/79ff24be-e1d1-4d30-8a51-bf05fa7e1bf6.jpg	2	f
\.


--
-- Data for Name: product_specifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_specifications (id, "productId", "specificationId", value) FROM stdin;
aa0e6df6-62b1-4931-9ab3-29410088ceef	8ccc0a6f-d310-461d-97cf-9014d4125124	d1f7b979-d553-46bb-b5ed-fd9a95490c3e	8
5b9d024c-048e-4455-9809-9c02155fe572	7176b1aa-f379-46af-89c6-67b7eb8a143c	d1f7b979-d553-46bb-b5ed-fd9a95490c3e	16
\.


--
-- Data for Name: product_variant_options; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_variant_options (id, "variantId", "optionId") FROM stdin;
2d6b9fa1-ed98-4f18-adf3-ba3badf419ed	c072933b-4d33-4765-868c-2b0ad4ce217a	11204f96-9bf6-48cb-914c-ef82540537e4
01647846-e9f1-439b-8761-d9f8d813f68a	a0e71f05-e690-4aab-9ca6-09edfcfd8354	550e8b43-b875-445d-8e6e-35faee547c34
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_variants (id, "productId", sku, price, "salePrice", "stockQuantity", "imageUrl", "isActive", "createdAt", "updatedAt") FROM stdin;
a0e71f05-e690-4aab-9ca6-09edfcfd8354	8ccc0a6f-d310-461d-97cf-9014d4125124	WATER-DEVKIT-V1-WIFI-BLUETOOTH-DO	170000	149000	50	\N	t	2026-09-08 09:52:24.448	2026-09-08 09:55:35.018
c072933b-4d33-4765-868c-2b0ad4ce217a	8ccc0a6f-d310-461d-97cf-9014d4125124	WATER-DEVKIT-V1-WIFI-BLUETOOTH-DEN	160000	139000	37	\N	t	2026-09-08 09:52:23.918	2026-09-21 18:38:08.801
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, "categoryId", "brandId", sku, name, slug, description, price, "salePrice", "stockQuantity", status, type, "viewCount", "soldCount", "createdAt", "updatedAt") FROM stdin;
86ae9777-0da8-4bce-94ac-1371c1792a98	ecc4d638-3510-4ff5-b9fe-4c0da9062255	adec876b-507b-4b46-b60e-8a7d591c6fee	LUMI-BO-ARDRUINO	Bộ Ardruino	bo-ardruino	\N	254000	234000	43	ACTIVE	COMBO	3	0	2026-09-08 12:49:53.67	2026-09-21 18:26:58.966
8ccc0a6f-d310-461d-97cf-9014d4125124	eec5e738-f182-4daf-a080-3dd66a3c321b	adec876b-507b-4b46-b60e-8a7d591c6fee	LUMI-WATER-DEVKIT-V1-WIFI-BLUETOOTH	WAter DevKit V1 WiFi + Bluetooth	water-devkit-v1-wifi-bluetooth	Board phát triển Water dual-core, WiFi 2.4GHz + BLE	150000	129000	50	ACTIVE	VARIABLE	12	3	2026-09-07 13:12:50.612	2026-09-21 20:22:53.535
7176b1aa-f379-46af-89c6-67b7eb8a143c	aa3543d4-0c25-4d49-ad38-0513c3bdc40f	adec876b-507b-4b46-b60e-8a7d591c6fee	LUMI-CAM-BIEN-PHOTORESISTOR	Cảm biến Photoresistor	cam-bien-photoresistor	Cảm biến Photoresistor chất lượng cao	15000	8000	85	ACTIVE	SIMPLE	18	100	2026-09-08 10:08:28.158	2026-09-21 20:27:02.204
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.questions (id, "productId", "userId", content, answer, "answeredAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.refresh_tokens (id, "userId", "tokenHash", "userAgent", "ipAddress", "expiresAt", "revokedAt", "createdAt") FROM stdin;
a371395a-761d-428a-91a1-ffeecec15bb9	f62b65dc-2370-49f9-b801-c4c7d37c5df7	$2b$10$BP5HUBzWRjOLKSPoHY3D3.ofJnsfASaPBSBokpM3dzldNSDNTUc9i	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	::1	2026-09-14 12:48:08	\N	2026-09-07 12:48:08.258
a9c8b333-5558-4678-b60f-cc2dabe9dd9d	7d163a34-5384-4685-8d75-3e7f478f11da	$2b$10$gRUZEaCTv39IddCvlbFamOsOsr84UR2qBtkPI.woTWOqrFOHoat92	Python-urllib/3.13	::1	2026-09-28 18:22:21	\N	2026-09-21 18:22:21.18
109f33d5-ca5b-4a2d-91d5-859c741d1be4	7d163a34-5384-4685-8d75-3e7f478f11da	$2b$10$HZP71/D2wP1tPTex57JHEudycRdLnQ5SqLLssGx8xNb8GoXUk9qB6	Python-urllib/3.13	::1	2026-09-28 18:26:54	\N	2026-09-21 18:26:54.501
89949211-157e-4732-b607-dbaa5f59b1b2	7d163a34-5384-4685-8d75-3e7f478f11da	$2b$10$MVx9pqNN.rhZrL1ZBcD3O.s7rhQYq028DODdQwDAmH0oSaxj68op.	Python-urllib/3.13	::1	2026-09-28 18:29:41	\N	2026-09-21 18:29:41.854
abc2ac4c-7544-40fd-9dfe-daa46a9c173f	7d163a34-5384-4685-8d75-3e7f478f11da	$2b$10$8WDHS8h6TDmYWjajbUWPPOLnmWczBf6TJKH3yRtK5xPhVQzyUs/cO	Python-urllib/3.13	::1	2026-09-28 18:37:56	\N	2026-09-21 18:37:56.223
74982fb4-8149-4c80-94ab-7189126bb788	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$Cj2ACpsMh6d3UCyQjGYTJe41/vNPUIMKaAo1xw8BEBraJGFHkwk9u	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-28 18:19:30	2026-09-21 20:21:09.126	2026-09-21 18:19:30.574
5c3ac407-a4d2-4ae5-93ec-a4137c915e42	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$8I7FIHnfZUy.n2qGu5oo/.G8iKZHj3qYNmg.PVuy5FS5HyETFvqlG	curl/8.15.0	::1	2026-09-28 18:18:55	2026-09-21 20:21:14.774	2026-09-21 18:18:55.834
4a79adbb-7bae-49fe-9f01-842ccdb2d661	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$8YOM59IRy3jtVcJzQCuT3uBFcXk7Xj1qMmqm3azmhRBmZCYBPQJ2W	Python-urllib/3.13	::1	2026-09-28 18:22:03	2026-09-21 20:21:14.774	2026-09-21 18:22:03.694
d1fe5727-2c22-4dcd-89ff-542f3249d47c	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$64PUH1CADGMWSo//HEwgAukDwULgwRmqRjOcIISE4d7YlzoAGMHte	Python-urllib/3.13	::1	2026-09-28 18:22:20	2026-09-21 20:21:14.774	2026-09-21 18:22:20.427
cbf7f6bb-81e3-430b-8f5a-9958e1424642	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$DqUoMzlfoD3nKc0f57.kMOLK346zgVbl96vAtZ3PSOMNQwL.ARbYq	Python-urllib/3.13	::1	2026-09-28 18:26:54	2026-09-21 20:21:14.774	2026-09-21 18:26:54.164
cb74ae0d-87a7-49f2-abd3-aa7e1528fe10	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$dGxdBG.VJFCb/yeAPK9tvOujd37m6fKP5NzlM9PwiHJWp8t5RMA.2	Python-urllib/3.13	::1	2026-09-28 18:29:41	2026-09-21 20:21:14.774	2026-09-21 18:29:41.363
1b16c9eb-8699-4d0c-bfd6-682e03073230	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$gA3RiaWGAF7HIbiOCMtjPeCTAkNFHvuseP5rSZQh1VY93NyIJPfwi	Python-urllib/3.13	::1	2026-09-28 18:37:55	2026-09-21 20:21:14.774	2026-09-21 18:37:55.327
4f8c5e9c-dcf0-4a4a-955c-69fd807a31e3	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$4Ou0wcguLEObNlRu31p4EOC3ElfMD66rPqZwFDrwKv3xIbhxfxaf.	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-28 20:21:09	2026-09-21 20:21:14.774	2026-09-21 20:21:09.464
edac56cf-45ed-449b-a979-939c25a7ca8e	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$GrOlof9hmNI9cwjbRW363eF5Thr8kM/NXRUeHgA8mUPxhDxUNCFLW	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-28 20:21:51	\N	2026-09-21 20:21:51.642
dc83a1a7-ecad-4137-a313-0b06f1290f7a	f62b65dc-2370-49f9-b801-c4c7d37c5df7	$2b$10$wHb/N.nufcDAinPFHFjIm.eW.Ks9H2MomqMSTbmTZUXUFbwh0GWOe	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	::1	2026-09-14 06:50:45	2026-09-07 12:48:07.897	2026-09-07 06:50:45.103
66f5632d-2324-4ca8-a558-28486ec9b094	f62b65dc-2370-49f9-b801-c4c7d37c5df7	$2b$10$y9u1Xw6EcaaBCXzkfBlWzu8tVV7I.OyjmsqUcQ6ckxnQ/hu9XyY86	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	::1	2026-09-13 13:09:30	2026-09-07 06:17:54.093	2026-09-06 13:09:30.965
9d7a1686-1b58-4c74-bbe8-34dbd42f8e46	f62b65dc-2370-49f9-b801-c4c7d37c5df7	$2b$10$BcjHpnfN/N0Bn784Fl5dtut1LQRe/mK8Ix.OrOHvgQZrQVQiEqiUi	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36	::1	2026-09-14 06:17:54	2026-09-07 06:50:44.71	2026-09-07 06:17:54.804
56324b28-0df4-4283-96da-39de90db5983	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$0k4ndjxbmph31yF6PJUGyOHOXUrFcEJw0sG6zYNN98P6qgz7FRxhy	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-28 17:59:27	2026-09-21 18:19:30.345	2026-09-21 17:59:27.889
46a60d05-703c-40a5-8b16-cf5220dce812	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$gKKhGGXhfWWslttI1bXLqeiWVYhS7J4AL3elZBljqHcC04bC1O4o.	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-26 07:44:23	2026-09-19 12:46:04.039	2026-09-19 07:44:23.743
285e0912-580e-4fe0-94c5-a60ead8c478f	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$/wKE734MTFPtEg8kxVNF9uunrySbQuC7iL3wp6qiwayFyaYpJ2pGW	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-26 12:46:04	2026-09-19 13:10:46.795	2026-09-19 12:46:04.366
60f51f32-1dd2-4f3c-a946-84442cfd4dc5	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$JzVXQm4vxt8ikFYjsJ2fYOmk/CjwCyT5AiKOmybLuK.zIZDaLn07a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-26 13:10:47	2026-09-19 13:29:06.622	2026-09-19 13:10:47.128
dc051eab-c10a-4e07-afee-f3f89440672d	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$1cj/BNknWzXCVu/0YP0RtObksE4gnnF97d4RUR/ifEcMawA1PcFKS	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-26 13:29:06	2026-09-19 16:35:46.734	2026-09-19 13:29:06.88
2f046f15-05f0-43ba-aaa2-50a01206271f	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$fcp0LpoaP8fRDwtN0vYzpud4UIQ4FYMBv9Qd1ARV3yZE9phnv/Jmi	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-26 16:35:46	2026-09-19 17:38:38.902	2026-09-19 16:35:47.019
7ad0b90d-cdf8-4dd6-aaed-4a7c61cfbbe5	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$Bd3vbUVntAiBBD4DTR8Z9unVvP7wqQVOr6oRrefl3aIw.KQWhwZn.	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-26 17:38:39	2026-09-19 17:55:12.502	2026-09-19 17:38:39.2
ae5548f4-1081-4401-ba0f-e1afb7688b05	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$eJTxr9mDzVdbcaUu4FXwC.ScNWaDv/sLRHgIXSk26FX6qkMgL3aki	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-26 17:55:12	2026-09-20 12:09:23.951	2026-09-19 17:55:12.786
1906a4e9-ae95-4227-9560-7aa5a7e36f1a	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$uoCxNKOezyy8IjetiGW0qefO1.lZzrsUVzQAF5eOt6UVu5UPeJxPy	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-27 12:09:24	2026-09-20 12:51:35.408	2026-09-20 12:09:24.266
74aacdfc-bb4b-465a-8d22-1625c0c728af	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$eJd8G8W0xaeF6VVa69KRwuM1UGe8EWqCn2xTURdNOxk3Uf.X/XDgi	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-27 12:51:35	2026-09-20 13:09:16.013	2026-09-20 12:51:35.714
e77abf5f-92cd-4fb2-a6d2-55910c0c60c9	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$4Vj6FWJYvx1S7cIcPrU99eiyMsDF8IrNpS0yYPQEfBwsB8eZpE.Pa	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-27 13:09:16	2026-09-20 14:16:37.783	2026-09-20 13:09:16.299
22a8ce11-c558-4d85-a70a-09dfea32f3e0	fd461e68-f9a4-4734-9768-26d6943658cf	$2b$10$2CB3sla.fZycqouFYZH7r.h588dVZi3VYFg63aifAPbHHuXbdQuwK	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	::1	2026-09-27 14:16:37	2026-09-21 17:59:27.572	2026-09-20 14:16:38.084
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reviews (id, "productId", "userId", rating, comment, status, "approvedAt", "createdAt", "updatedAt", "moderationReason", "orderId", "verifiedPurchase") FROM stdin;
0ddedb5f-d988-44a6-bed4-1f3801617c17	7176b1aa-f379-46af-89c6-67b7eb8a143c	fd461e68-f9a4-4734-9768-26d6943658cf	5	Sản phẩm tốt, chất lượng	APPROVED	2026-09-13 15:45:58.476	2026-09-13 15:42:30.866	2026-09-13 15:45:58.478	\N	\N	f
db23c0a1-2317-4ea4-9ed2-aca87666fb91	8ccc0a6f-d310-461d-97cf-9014d4125124	fd461e68-f9a4-4734-9768-26d6943658cf	5	tốt nha	APPROVED	2026-09-21 18:04:38.235	2026-09-21 18:04:30.093	2026-09-21 18:04:38.236	\N	1b67306b-a97d-4521-8d21-5abc4c82c1ee	t
\.


--
-- Data for Name: serials; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.serials (id, code, "productId", "variantId", status, "warrantyMonths", "activatedAt", "warrantyEndAt", "ownerName", "ownerPhone", note, "createdAt", "updatedAt", "ownerUserId", "userId", "orderId") FROM stdin;
32a260c4-12c2-422e-afc8-eea42dd47496	LUMI-CAM-BIEN-PHOTORESISTOR-00001	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	ACTIVATED	12	2026-09-13 15:36:55.512	2027-09-13 15:36:55.512	Quản trị viên	0396205536	\N	2026-09-13 10:14:21.333	2026-09-13 15:36:55.639	fd461e68-f9a4-4734-9768-26d6943658cf	\N	9dc16dd1-4105-45ea-b44b-0595cbc15917
df5f43e4-cd26-4e22-97b1-7a287f77e68a	LUMI-CAM-BIEN-PHOTORESISTOR-00003	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
871bb8c9-542e-4114-b7b0-d61ece6f0f9c	LUMI-CAM-BIEN-PHOTORESISTOR-00004	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
c080955c-846f-46b0-b60e-cb3bbc7a8f79	LUMI-CAM-BIEN-PHOTORESISTOR-00005	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
783d5fa7-6e20-40d2-ac47-ef284217999d	LUMI-CAM-BIEN-PHOTORESISTOR-00006	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
98fd6666-16da-40ab-a617-211fc1556751	LUMI-CAM-BIEN-PHOTORESISTOR-00007	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
dcb0d5a0-e4f8-4b52-901c-0990c7b7293f	LUMI-CAM-BIEN-PHOTORESISTOR-00008	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
a7533a6a-18f4-4340-9915-dd253c57376d	LUMI-CAM-BIEN-PHOTORESISTOR-00009	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
3a74e8ba-b3d9-4b86-81f9-872397b28329	LUMI-CAM-BIEN-PHOTORESISTOR-00010	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
f317db4d-1306-482a-9e42-33c5ecd07e2e	LUMI-CAM-BIEN-PHOTORESISTOR-00011	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
e1779428-e990-408f-958a-336c9bfc99d3	LUMI-CAM-BIEN-PHOTORESISTOR-00012	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
3fa39e25-180d-4189-8465-fa4e964f7108	LUMI-CAM-BIEN-PHOTORESISTOR-00013	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
969217fb-91ce-44ba-a500-5c4d21d7bc86	LUMI-CAM-BIEN-PHOTORESISTOR-00014	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
49d2745e-e247-44ff-8b16-788929a85d13	LUMI-CAM-BIEN-PHOTORESISTOR-00015	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
936c0689-dde3-4e0e-9f0b-adb06d6752b5	LUMI-CAM-BIEN-PHOTORESISTOR-00016	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
b772a102-773b-4160-8a02-8fc19c09c851	LUMI-CAM-BIEN-PHOTORESISTOR-00017	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
ef493645-e157-452e-9752-e9db77006883	LUMI-CAM-BIEN-PHOTORESISTOR-00018	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
14806880-4446-43db-ac74-0901f18443f3	LUMI-CAM-BIEN-PHOTORESISTOR-00019	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
8ff56f6d-b3d4-4d0f-8092-db7c27f7b7c7	LUMI-CAM-BIEN-PHOTORESISTOR-00020	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
9941ed0b-363d-4a8a-84dd-ce9b0502a390	LUMI-CAM-BIEN-PHOTORESISTOR-00021	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
d2c4e5fd-dab1-4ccb-98dd-c3b7a98143be	LUMI-CAM-BIEN-PHOTORESISTOR-00022	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
0cfbd1d0-a140-4ff0-99ea-26e40ef75a74	LUMI-CAM-BIEN-PHOTORESISTOR-00023	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
6303ca13-c0e6-4e63-b084-7b93e54f01c0	LUMI-CAM-BIEN-PHOTORESISTOR-00024	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
e0255b8f-841e-4c9f-a56b-205653f54b88	LUMI-CAM-BIEN-PHOTORESISTOR-00025	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
9b20effa-0ce2-446f-a31f-a127adfdec61	LUMI-CAM-BIEN-PHOTORESISTOR-00026	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
265ac622-213c-4d75-bf15-39d3b9b2d426	LUMI-CAM-BIEN-PHOTORESISTOR-00027	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
87122809-ebd9-4c94-8798-ca4e4c2820fa	LUMI-CAM-BIEN-PHOTORESISTOR-00028	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
e9171734-b9a7-41b7-9d7e-d0368c9e89be	LUMI-CAM-BIEN-PHOTORESISTOR-00029	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
9fb3cd7a-2c11-4a48-bdee-420532ea44e9	LUMI-CAM-BIEN-PHOTORESISTOR-00030	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
559995f9-4ce4-4fc3-8b4d-4fc33968ef03	LUMI-CAM-BIEN-PHOTORESISTOR-00031	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
a1ecada5-4fad-4519-ad61-03f4fcb417c7	LUMI-CAM-BIEN-PHOTORESISTOR-00032	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
18e588f6-7371-4d87-9e70-3531d55eefdf	LUMI-CAM-BIEN-PHOTORESISTOR-00033	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
d5519b48-a556-4fe0-92af-8192b5157c68	LUMI-CAM-BIEN-PHOTORESISTOR-00034	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
6dfb60c7-600b-47a0-bda2-3f2b0847e7f3	LUMI-CAM-BIEN-PHOTORESISTOR-00035	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
a0f1ff94-f24f-47b3-9cf3-4ddb288ca8fa	LUMI-CAM-BIEN-PHOTORESISTOR-00036	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
fe6a27a6-64ce-4fd5-840a-0d6ab28abf07	LUMI-CAM-BIEN-PHOTORESISTOR-00037	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
eafff3e5-d6a2-4af2-bfad-5dab1dc1e539	LUMI-CAM-BIEN-PHOTORESISTOR-00038	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
1880e4a9-ca9c-4702-a962-2e813ee3a4a7	LUMI-CAM-BIEN-PHOTORESISTOR-00039	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
0586833c-e076-4b21-85fc-39c4ead1fd9e	LUMI-CAM-BIEN-PHOTORESISTOR-00040	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
6ae209bd-91bc-43f4-9ff7-6f21ff739375	LUMI-CAM-BIEN-PHOTORESISTOR-00041	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
5fbd7f32-6199-432a-8369-f24b124ae0a8	LUMI-CAM-BIEN-PHOTORESISTOR-00042	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
3fed9f48-c73d-4d03-b4b6-0ea01d0d32ba	LUMI-CAM-BIEN-PHOTORESISTOR-00043	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
4be06d36-06f6-4303-b1be-68cc6a59e48e	LUMI-CAM-BIEN-PHOTORESISTOR-00044	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
9ebd50b3-37c6-457a-81e1-e7841722eeb7	LUMI-CAM-BIEN-PHOTORESISTOR-00045	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
b4f6ec10-6a0f-4eee-a2bd-85b20b6d01fb	LUMI-CAM-BIEN-PHOTORESISTOR-00046	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
2bdc1eba-91a0-42cc-9f74-7bb682a72422	LUMI-CAM-BIEN-PHOTORESISTOR-00047	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
662140d3-52dc-48a8-9be5-31b410f71781	LUMI-CAM-BIEN-PHOTORESISTOR-00048	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
fd12fa5b-5a62-414c-a358-acd4af8268e7	LUMI-CAM-BIEN-PHOTORESISTOR-00049	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
65c36f5b-7ce0-4dfb-ba35-94c1ecfea967	LUMI-CAM-BIEN-PHOTORESISTOR-00050	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
322c4630-4430-4ed2-a170-3decfe9b3546	LUMI-CAM-BIEN-PHOTORESISTOR-00051	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
6f60e931-581b-42af-b160-6c5228e18efb	LUMI-CAM-BIEN-PHOTORESISTOR-00052	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
96b53ed5-7c75-4321-a54f-3a42f0aa56d1	LUMI-CAM-BIEN-PHOTORESISTOR-00053	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
9641b11d-3f5a-46b7-9882-85514fa4f88d	LUMI-CAM-BIEN-PHOTORESISTOR-00054	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
c637fbf1-07e2-4a89-82ac-40fac844bb6f	LUMI-CAM-BIEN-PHOTORESISTOR-00055	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
185353f8-d02b-473e-86bb-5b8ebd74c9c1	LUMI-CAM-BIEN-PHOTORESISTOR-00056	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
fdf81e9f-e9f1-453f-a768-fa32bd29df3a	LUMI-CAM-BIEN-PHOTORESISTOR-00057	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
0b4e7146-f1e3-47a6-b083-2028eecd4b35	LUMI-CAM-BIEN-PHOTORESISTOR-00058	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
2305e63f-557d-4bed-8196-9e8f98371e66	LUMI-CAM-BIEN-PHOTORESISTOR-00059	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
1b014a7e-cbe4-4b6d-b89a-85f0c8e087a8	LUMI-CAM-BIEN-PHOTORESISTOR-00060	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
5dd1a062-baf7-4ef5-9213-4efb93c88612	LUMI-CAM-BIEN-PHOTORESISTOR-00061	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
193b03ac-fcaa-428d-9032-18e2a35ddd6e	LUMI-CAM-BIEN-PHOTORESISTOR-00062	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
6d397a63-f144-4028-ada6-58aea45f0161	LUMI-CAM-BIEN-PHOTORESISTOR-00063	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
9be3eef8-b978-4a6a-a49c-08359a5b7e80	LUMI-CAM-BIEN-PHOTORESISTOR-00064	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
68c417e6-14fe-4cde-aa7f-b0f8a4d24e8f	LUMI-CAM-BIEN-PHOTORESISTOR-00065	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
75b775e2-361d-4a2f-8e89-7bd301518526	LUMI-CAM-BIEN-PHOTORESISTOR-00066	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
9b7be9e4-2cb8-4ab9-ab27-c3d17d35b911	LUMI-CAM-BIEN-PHOTORESISTOR-00067	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
8029771a-b4e8-4318-9a38-baa7c440c0a5	LUMI-CAM-BIEN-PHOTORESISTOR-00068	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
dafaa852-aca9-4580-b475-c524120f3806	LUMI-CAM-BIEN-PHOTORESISTOR-00069	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
fa92343c-c3f2-4c10-a42f-6e0ef5b2cf84	LUMI-CAM-BIEN-PHOTORESISTOR-00070	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
c9f1fc57-c6c3-41f1-bd96-869eabde1a72	LUMI-CAM-BIEN-PHOTORESISTOR-00071	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
be92c34c-fbc8-4590-a0aa-e345412701b4	LUMI-CAM-BIEN-PHOTORESISTOR-00072	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
e392c3e7-3b46-48bd-ac2f-dfbdf7bed9a2	LUMI-CAM-BIEN-PHOTORESISTOR-00073	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
f9d15116-c4bb-412c-93bc-ca78cafa3245	LUMI-CAM-BIEN-PHOTORESISTOR-00074	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
cc5e95cc-de62-47e4-ab17-0ca62572c639	LUMI-CAM-BIEN-PHOTORESISTOR-00075	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
ed7247ce-7f0c-4e2a-8257-d03597d108c7	LUMI-CAM-BIEN-PHOTORESISTOR-00076	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
3934d684-e540-4f7a-970c-d60175711c21	LUMI-CAM-BIEN-PHOTORESISTOR-00077	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
5d577bdd-5b95-4003-9f77-da10cc2ad930	LUMI-CAM-BIEN-PHOTORESISTOR-00078	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
f2e6afdc-ffa3-4233-8c98-01ebc9244f53	LUMI-CAM-BIEN-PHOTORESISTOR-00079	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
58b66ac2-3205-4171-a236-6bcf411ff123	LUMI-CAM-BIEN-PHOTORESISTOR-00080	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
ff48cf9b-186c-4d0b-9ff9-c66e5ae59df8	LUMI-CAM-BIEN-PHOTORESISTOR-00081	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
df004f12-4346-4137-a415-0add0bcd7d40	LUMI-CAM-BIEN-PHOTORESISTOR-00082	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
d5b1ab31-2dd2-4879-99be-d521f31a44ee	LUMI-CAM-BIEN-PHOTORESISTOR-00083	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
2024cf02-e678-48a6-a9ad-d87051ff054b	LUMI-CAM-BIEN-PHOTORESISTOR-00084	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
407dd06e-f33b-47ba-8db3-5f4ebd7f8d03	LUMI-CAM-BIEN-PHOTORESISTOR-00085	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
b530949a-f4c5-4d09-b403-90c160080e28	LUMI-CAM-BIEN-PHOTORESISTOR-00086	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
45c9d2e2-c380-43d5-acbe-e50817f0bdc8	LUMI-CAM-BIEN-PHOTORESISTOR-00087	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
1243f4c1-ce75-4420-8b50-e73954fa7d60	LUMI-CAM-BIEN-PHOTORESISTOR-00088	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
1dea7eea-7e37-4b15-a6e0-8a8f93a9d7e2	LUMI-CAM-BIEN-PHOTORESISTOR-00089	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
8e4f0416-f148-4c91-9698-d783d89c3717	LUMI-CAM-BIEN-PHOTORESISTOR-00090	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
60095747-2758-4c1c-99b0-1d3affafd642	LUMI-CAM-BIEN-PHOTORESISTOR-00091	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
24a48d40-3908-45fd-8a8a-8a2034790d2d	LUMI-CAM-BIEN-PHOTORESISTOR-00092	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
69629d9c-94c8-44c8-ab2b-04cd2f37c91f	LUMI-CAM-BIEN-PHOTORESISTOR-00093	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
79b51cf6-4787-4699-8c43-084a860f03b3	LUMI-CAM-BIEN-PHOTORESISTOR-00094	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
fd30b9eb-2874-4158-b9b4-ef8601e75341	LUMI-CAM-BIEN-PHOTORESISTOR-00095	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
48946775-4876-4154-b1e4-e8b82f0b4836	LUMI-CAM-BIEN-PHOTORESISTOR-00096	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
c09e85c0-a27f-4d53-8958-16d3b60ab803	LUMI-CAM-BIEN-PHOTORESISTOR-00097	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
7a667b63-02f3-470a-8143-5049546c11e4	LUMI-CAM-BIEN-PHOTORESISTOR-00098	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
dffdcbac-f55c-4b82-98a3-10fb6f06c1cc	LUMI-CAM-BIEN-PHOTORESISTOR-00099	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	IN_STOCK	12	\N	\N	\N	\N	\N	2026-09-13 10:14:21.333	2026-09-13 10:14:21.333	\N	\N	\N
f4eb57c8-61a5-470d-99d8-adfff6276f8c	LUMI-CAM-BIEN-PHOTORESISTOR-00002	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	ACTIVATED	12	2026-09-14 07:24:27.937	2027-09-14 07:24:27.937	Quản trị viên	0396205536	\N	2026-09-13 10:14:21.333	2026-09-14 07:24:28.104	fd461e68-f9a4-4734-9768-26d6943658cf	\N	c44112c9-b2f4-452e-97e2-fbea43a03507
\.


--
-- Data for Name: specifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.specifications (id, name, unit, "dataType", "createdAt") FROM stdin;
d1f7b979-d553-46bb-b5ed-fd9a95490c3e	Ram	GB	NUMBER	2026-09-08 07:42:55.245
\.


--
-- Data for Name: support_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.support_messages (id, "ticketId", "senderId", "isStaff", body, "createdAt", attachments) FROM stdin;
396eaa17-8222-4709-b8bc-02f0b4df0a48	c082d10f-a98a-474f-8147-c29be8a4b525	fd461e68-f9a4-4734-9768-26d6943658cf	t	Shop sẽ hỗ trợ đổi ạ	2026-09-20 12:13:40.12	{}
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.support_tickets (id, code, "userId", "orderId", type, status, subject, "createdAt", "updatedAt") FROM stdin;
c082d10f-a98a-474f-8147-c29be8a4b525	YCMU9S19H5JRO	fd461e68-f9a4-4734-9768-26d6943658cf	c44112c9-b2f4-452e-97e2-fbea43a03507	RETURN	IN_PROGRESS	Đổi / Trả hàng - đơn DHMU0WJF4G4CMQ	2026-09-20 12:12:43.965	2026-09-20 12:59:00.754
\.


--
-- Data for Name: user_consents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_consents (id, "userId", type, version, granted, "grantedAt", "revokedAt", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: user_events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_events (id, type, "userId", "productId", "categoryId", keyword, "createdAt") FROM stdin;
428e3043-4c46-491d-af5b-6e9d77d4ef21	VIEW_CATEGORY	\N	\N	eec5e738-f182-4daf-a080-3dd66a3c321b	\N	2026-09-13 13:15:57.597
1abb225e-2250-490d-9e99-fffd53b58e84	VIEW_CATEGORY	\N	\N	ecc4d638-3510-4ff5-b9fe-4c0da9062255	\N	2026-09-13 14:49:12.244
ba474204-d80f-4b09-b119-2b3458bc0834	VIEW_PRODUCT	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-13 15:40:22.213
9fc35aa1-4dc3-4753-9895-631a288b7cf5	VIEW_PRODUCT	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-13 15:42:06.625
52424394-5a84-4350-85ae-bb855184c78f	VIEW_PRODUCT	\N	8ccc0a6f-d310-461d-97cf-9014d4125124	\N	\N	2026-09-14 07:01:41.841
c55607db-fe8f-4543-9fda-407c20a91f68	VIEW_PRODUCT	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-14 07:08:08.653
30107ae0-a19c-4826-9b28-4a655426f71f	VIEW_PRODUCT	\N	8ccc0a6f-d310-461d-97cf-9014d4125124	\N	\N	2026-09-14 07:23:58.599
5476168f-4db4-4bdf-b598-3a3e197ff5cf	VIEW_PRODUCT	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-19 07:45:26.414
46554a11-1e5e-4b7e-bcea-ed8cb31e2fee	VIEW_PRODUCT	\N	8ccc0a6f-d310-461d-97cf-9014d4125124	\N	\N	2026-09-19 07:47:41.101
76eebe60-d711-44b9-85c1-1201783e51a0	VIEW_PRODUCT	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-19 07:47:49.965
69eeec54-0b09-43f0-8633-9eb52ab4eaf4	VIEW_PRODUCT	\N	86ae9777-0da8-4bce-94ac-1371c1792a98	\N	\N	2026-09-19 16:35:46.54
d87d1700-2969-4c5a-8778-69aa153ebac0	VIEW_PRODUCT	\N	8ccc0a6f-d310-461d-97cf-9014d4125124	\N	\N	2026-09-21 18:01:17.117
72873eb5-38e7-481e-8fd2-ffbacb9e987f	VIEW_PRODUCT	\N	8ccc0a6f-d310-461d-97cf-9014d4125124	\N	\N	2026-09-21 18:04:48.72
5238c27f-c180-4562-b952-ad8d238998e8	VIEW_PRODUCT	\N	8ccc0a6f-d310-461d-97cf-9014d4125124	\N	\N	2026-09-21 20:22:52.238
8839f294-5616-4a92-9d0e-5bb36ac13ba9	VIEW_PRODUCT	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-13 15:46:06.971
d94d54d9-b2d7-4c67-ab69-70d5f686d660	VIEW_PRODUCT	\N	8ccc0a6f-d310-461d-97cf-9014d4125124	\N	\N	2026-09-14 07:01:50.324
cf7fd117-aefe-40c1-900c-b012eec08984	ADD_TO_CART	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-14 07:08:11.635
34025c4f-4ab1-4f2f-8cc0-7eef8dbe8c5f	VIEW_PRODUCT	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-14 07:25:13.198
80a32135-82a4-481e-bdbb-5d6b6fe87f84	VIEW_PRODUCT	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-19 07:45:32.981
ba4fabd9-6c93-4ede-8367-e2688a867102	ADD_TO_CART	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-19 07:47:54.53
5cc629ab-d727-497f-95b2-fee8d7241237	VIEW_PRODUCT	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-19 07:48:05.652
f1111b60-e678-46eb-994e-bd6a0e488913	ADD_TO_CART	\N	8ccc0a6f-d310-461d-97cf-9014d4125124	\N	\N	2026-09-21 18:01:20.97
0e3dd98c-fd7f-4c28-82d1-c1aa102f8ae8	ADD_TO_CART	\N	8ccc0a6f-d310-461d-97cf-9014d4125124	\N	\N	2026-09-21 20:23:15.304
535890f4-b100-4891-b97d-6ac2a13e585f	VIEW_PRODUCT	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-21 20:27:01.298
44d93e0f-0df8-4fe4-8db4-0b8945f4c1f1	ADD_TO_CART	\N	7176b1aa-f379-46af-89c6-67b7eb8a143c	\N	\N	2026-09-14 07:25:16.114
8b7a4d4e-ff59-4e0c-afb0-290f0cfc050d	VIEW_PRODUCT	\N	8ccc0a6f-d310-461d-97cf-9014d4125124	\N	\N	2026-09-21 18:02:41.141
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, "passwordHash", "fullName", phone, "avatarUrl", role, "isActive", "isEmailVerified", "createdAt", "updatedAt", address, "googleId") FROM stdin;
f62b65dc-2370-49f9-b801-c4c7d37c5df7	phantruc313@gmail.com	$2b$10$IZjEADiEyZlybsuo1LcwcO72kynk8BO/6xDhpvBlkVMNgPPFdV3oe	Phan Minh Trúc	\N	\N	ADMIN	t	f	2026-09-06 10:11:12.42	2026-09-06 10:11:12.42	\N	\N
fd461e68-f9a4-4734-9768-26d6943658cf	admin@tmdt-iot.local	$2b$10$CEAxWbeINy5b.F1myf7MuO5ZedsOBlvA0ohQlVX68TutTsF.vwxJe	Quản trị viên	\N	\N	ADMIN	t	t	2026-09-06 10:11:37.572	2026-09-06 10:11:37.572	\N	\N
7d163a34-5384-4685-8d75-3e7f478f11da	customer@tmdt-iot.local	$2b$10$OPD07nACXBMFt6l9iVieyevNJahLj8eVplfW7Pn6YfRS.x1Mnd4ju	Khách hàng demo	\N	\N	CUSTOMER	t	t	2026-09-06 10:11:38.141	2026-09-06 10:11:38.141	\N	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: combo_items combo_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.combo_items
    ADD CONSTRAINT combo_items_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_attribute_options product_attribute_options_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_attribute_options
    ADD CONSTRAINT product_attribute_options_pkey PRIMARY KEY (id);


--
-- Name: product_attributes product_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_specifications product_specifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT product_specifications_pkey PRIMARY KEY (id);


--
-- Name: product_variant_options product_variant_options_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_variant_options
    ADD CONSTRAINT product_variant_options_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: serials serials_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.serials
    ADD CONSTRAINT serials_pkey PRIMARY KEY (id);


--
-- Name: specifications specifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.specifications
    ADD CONSTRAINT specifications_pkey PRIMARY KEY (id);


--
-- Name: support_messages support_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: user_consents user_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_consents
    ADD CONSTRAINT user_consents_pkey PRIMARY KEY (id);


--
-- Name: user_events user_events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT user_events_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_role_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "audit_logs_role_createdAt_idx" ON public.audit_logs USING btree (role, "createdAt");


--
-- Name: brands_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX brands_slug_key ON public.brands USING btree (slug);


--
-- Name: cart_items_cartId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "cart_items_cartId_idx" ON public.cart_items USING btree ("cartId");


--
-- Name: cart_items_cartId_productId_variantId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "cart_items_cartId_productId_variantId_key" ON public.cart_items USING btree ("cartId", "productId", "variantId");


--
-- Name: carts_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "carts_userId_key" ON public.carts USING btree ("userId");


--
-- Name: categories_parentId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "categories_parentId_idx" ON public.categories USING btree ("parentId");


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: combo_items_comboId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "combo_items_comboId_idx" ON public.combo_items USING btree ("comboId");


--
-- Name: combo_items_comboId_productId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "combo_items_comboId_productId_key" ON public.combo_items USING btree ("comboId", "productId");


--
-- Name: order_items_orderId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "order_items_orderId_idx" ON public.order_items USING btree ("orderId");


--
-- Name: order_status_history_orderId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "order_status_history_orderId_idx" ON public.order_status_history USING btree ("orderId");


--
-- Name: orders_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX orders_code_key ON public.orders USING btree (code);


--
-- Name: orders_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "orders_userId_idx" ON public.orders USING btree ("userId");


--
-- Name: product_attribute_options_attributeId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_attribute_options_attributeId_idx" ON public.product_attribute_options USING btree ("attributeId");


--
-- Name: product_attribute_options_attributeId_value_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "product_attribute_options_attributeId_value_key" ON public.product_attribute_options USING btree ("attributeId", value);


--
-- Name: product_attributes_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_attributes_productId_idx" ON public.product_attributes USING btree ("productId");


--
-- Name: product_attributes_productId_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "product_attributes_productId_name_key" ON public.product_attributes USING btree ("productId", name);


--
-- Name: product_images_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_images_productId_idx" ON public.product_images USING btree ("productId");


--
-- Name: product_specifications_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_specifications_productId_idx" ON public.product_specifications USING btree ("productId");


--
-- Name: product_specifications_productId_specificationId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "product_specifications_productId_specificationId_key" ON public.product_specifications USING btree ("productId", "specificationId");


--
-- Name: product_variant_options_variantId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_variant_options_variantId_idx" ON public.product_variant_options USING btree ("variantId");


--
-- Name: product_variant_options_variantId_optionId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "product_variant_options_variantId_optionId_key" ON public.product_variant_options USING btree ("variantId", "optionId");


--
-- Name: product_variants_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "product_variants_productId_idx" ON public.product_variants USING btree ("productId");


--
-- Name: product_variants_sku_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);


--
-- Name: products_brandId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "products_brandId_idx" ON public.products USING btree ("brandId");


--
-- Name: products_categoryId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "products_categoryId_idx" ON public.products USING btree ("categoryId");


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: products_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX products_status_idx ON public.products USING btree (status);


--
-- Name: questions_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "questions_productId_idx" ON public.questions USING btree ("productId");


--
-- Name: refresh_tokens_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "refresh_tokens_userId_idx" ON public.refresh_tokens USING btree ("userId");


--
-- Name: reviews_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "reviews_productId_idx" ON public.reviews USING btree ("productId");


--
-- Name: reviews_productId_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "reviews_productId_userId_key" ON public.reviews USING btree ("productId", "userId");


--
-- Name: serials_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX serials_code_key ON public.serials USING btree (code);


--
-- Name: serials_productId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "serials_productId_idx" ON public.serials USING btree ("productId");


--
-- Name: specifications_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX specifications_name_key ON public.specifications USING btree (name);


--
-- Name: support_messages_ticketId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "support_messages_ticketId_idx" ON public.support_messages USING btree ("ticketId");


--
-- Name: support_tickets_code_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX support_tickets_code_key ON public.support_tickets USING btree (code);


--
-- Name: support_tickets_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX support_tickets_status_idx ON public.support_tickets USING btree (status);


--
-- Name: support_tickets_userId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "support_tickets_userId_idx" ON public.support_tickets USING btree ("userId");


--
-- Name: user_consents_userId_type_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "user_consents_userId_type_idx" ON public.user_consents USING btree ("userId", type);


--
-- Name: user_events_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "user_events_createdAt_idx" ON public.user_events USING btree ("createdAt");


--
-- Name: user_events_type_createdAt_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "user_events_type_createdAt_idx" ON public.user_events USING btree (type, "createdAt");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_googleId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "users_googleId_key" ON public.users USING btree ("googleId");


--
-- Name: cart_items cart_items_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public.carts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_items cart_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_items cart_items_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: carts carts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: combo_items combo_items_comboId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.combo_items
    ADD CONSTRAINT "combo_items_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: combo_items combo_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.combo_items
    ADD CONSTRAINT "combo_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: combo_items combo_items_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.combo_items
    ADD CONSTRAINT "combo_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_attribute_options product_attribute_options_attributeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_attribute_options
    ADD CONSTRAINT "product_attribute_options_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES public.product_attributes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_attributes product_attributes_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT "product_attributes_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_images product_images_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_specifications product_specifications_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT "product_specifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_specifications product_specifications_specificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT "product_specifications_specificationId_fkey" FOREIGN KEY ("specificationId") REFERENCES public.specifications(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_variant_options product_variant_options_optionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_variant_options
    ADD CONSTRAINT "product_variant_options_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES public.product_attribute_options(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_variant_options product_variant_options_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_variant_options
    ADD CONSTRAINT "product_variant_options_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variants product_variants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: questions questions_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "questions_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: questions questions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: serials serials_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.serials
    ADD CONSTRAINT "serials_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: serials serials_ownerUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.serials
    ADD CONSTRAINT "serials_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: serials serials_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.serials
    ADD CONSTRAINT "serials_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: serials serials_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.serials
    ADD CONSTRAINT "serials_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: serials serials_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.serials
    ADD CONSTRAINT "serials_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: support_messages support_messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT "support_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: support_messages support_messages_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT "support_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public.support_tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT "support_tickets_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: support_tickets support_tickets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_consents user_consents_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_consents
    ADD CONSTRAINT "user_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict oiwGUmUS9lMI2nD78400sdIivUvFaz5FYbJt7793C8jWsIBFBA5TtcGyLUHQAQU

