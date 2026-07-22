import assert from 'node:assert/strict';
import test from 'node:test';
import { categoryFor, feedUrls, imageFrom, mediaUrl, truncate } from '../src/newsUtils.js';

test('feedUrls trims and removes empty values', () => {
  assert.deepEqual(feedUrls(' https://a.test/rss.xml, ,https://b.test/feed '), ['https://a.test/rss.xml', 'https://b.test/feed']);
});

test('categoryFor maps common feed titles', () => {
  assert.equal(categoryFor('World News'), 'World');
  assert.equal(categoryFor('Latest Technology'), 'Technology');
  assert.equal(categoryFor('Finance Headlines'), 'Business');
  assert.equal(categoryFor('Football Sports'), 'Sports');
  assert.equal(categoryFor('Local Updates'), 'General');
});

test('mediaUrl handles rss-parser object and array shapes', () => {
  assert.equal(mediaUrl({ $: { url: 'https://img.test/one.jpg' } }), 'https://img.test/one.jpg');
  assert.equal(mediaUrl([{ url: 'https://img.test/two.jpg' }]), 'https://img.test/two.jpg');
  assert.equal(mediaUrl(undefined), null);
});

test('imageFrom prefers enclosure then media fields', () => {
  assert.equal(imageFrom({ enclosure: { url: 'https://img.test/enclosure.jpg' } }), 'https://img.test/enclosure.jpg');
  assert.equal(imageFrom({ 'media:thumbnail': { $: { url: 'https://img.test/thumb.jpg' } } }), 'https://img.test/thumb.jpg');
});

test('truncate strips html, normalizes whitespace, and caps length', () => {
  assert.equal(truncate('<p>Hello   world</p>', 20), 'Hello world');
  assert.equal(truncate('1234567890', 6), '12345…');
});
