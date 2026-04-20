/**
 * Homepage hero performance: lighter rimg caps on compact heights, lazy slides when multi-slide.
 * Invariant: faster above-the-fold work improves conversion (LCP vs bytes tradeoffs documented in Liquid).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const slideshow = fs.readFileSync(path.join(__dirname, '..', 'sections', 'dynamic-slideshow.liquid'), 'utf8');
const slide = fs.readFileSync(path.join(__dirname, '..', 'snippets', 'slideshow-slide.liquid'), 'utf8');

assert.match(
  slideshow,
  /section\.blocks\.size\s*>\s*1[\s\S]{0,400}performance_lazyload\s*=\s*true/,
  'slideshow: multi-slide carousels must opt into lazy loading'
);
assert.match(slideshow, /slideshow_rimg_desktop/, 'slideshow: must define desktop rimg cap variable');
assert.match(slideshow, /slideshow_height\s*==\s*['"]small['"]/, 'slideshow: must branch on compact hero height for lighter assets');
assert.match(slideshow, /1280x/, 'slideshow: compact hero must cap desktop decode width');

assert.match(slide, /hero_desktop_size/, 'slideshow-slide: must accept hero_desktop_size from section');
assert.match(slide, /slide_lazy/, 'slideshow-slide: must support per-slide lazy override for slide index > 0');
assert.match(slide, /block_index\s*>\s*0/, 'slideshow-slide: must lazy-load after first slide when parent is eager');
assert.match(slide, /temusy_show_price_strip/, 'slideshow-slide: must support transactional hero price strip toggle');
assert.match(slide, /temusy-hero-price-strip/, 'slideshow-slide: must render transactional SKU strip markup');
assert.match(slide, /temusy_strip_layout/, 'slideshow-slide: must support campaign strip placement (on image vs below CTA)');
assert.match(slide, /temusy_strip_visual/, 'slideshow-slide: must pass the configured visual style to the strip');
assert.match(slide, /slideshow-slide__visual--with-strip/, 'slideshow-slide: must expose a stable visual hook for image-overlay deal cards');
assert.match(slideshow, /temusy_strip_layout/, 'slideshow schema: must expose price strip placement in the Theme Editor');
assert.match(slideshow, /temusy_strip_visual/, 'slideshow schema: must expose price strip visual style in the Theme Editor');
assert.match(slideshow, /temusy-hero-price-strip__cell--polaroid/, 'slideshow css: must include campaign card styling for hero deal rail');

const heroStrip = fs.readFileSync(path.join(__dirname, '..', 'snippets', 'temusy-hero-price-strip.liquid'), 'utf8');
assert.match(heroStrip, /if lim > 4/, 'hero price strip: must hard-cap product count to protect LCP');
assert.match(heroStrip, /selected_or_first_available_variant/, 'hero price strip: must derive live prices from variant data');
assert.match(heroStrip, /aria-label=/, 'hero price strip: product links must expose accessible product + price context');

console.log('slideshow-hero-performance-contract: ok');
