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
assert.match(slide, /temusy_strip_layout/, 'slideshow-slide: must support marketplace strip placement (on image vs below CTA)');

console.log('slideshow-hero-performance-contract: ok');
