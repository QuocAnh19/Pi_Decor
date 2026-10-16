import React from "react";
import { Helmet } from "react-helmet-async";
import { siteConfig } from "../../lib/siteConfig";

export interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = siteConfig.description,
  canonical,
  ogImage = siteConfig.defaultOgImage,
  ogType = "website",
  noindex = false,
  jsonLd,
}) => {
  const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
  const canonicalUrl = canonical
    ? canonical.startsWith("http")
      ? canonical
      : `${siteConfig.siteUrl}${canonical}`
    : siteConfig.siteUrl;
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${siteConfig.siteUrl}${ogImage}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content={siteConfig.name} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};
