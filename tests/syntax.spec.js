/*
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */

import {describe, it} from 'mocha';
import {DIDResolutionError, INVALID_DID} from '../lib/errors.js';
import {isValidDid, parseDid} from '../lib/syntax.js';
import {expect} from 'chai';

describe('isValidDid', () => {
  it('accepts DIDs of several methods', () => {
    for(const did of [
      'did:example:123',
      'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
      'did:web:example.com:user:alice',
      'did:example:a%20b',
      'did:example::123'
    ]) {
      expect(isValidDid(did), did).to.be.true;
    }
  });

  it('rejects malformed DIDs', () => {
    for(const did of [
      'not-a-did',
      'did:',
      'did:example',
      'did:example:',
      'did:Example:123',
      'did:example:a b',
      'did:example:%zz',
      'did:example:123:',
      ''
    ]) {
      expect(isValidDid(did), did).to.be.false;
    }
  });

  it('rejects non-strings', () => {
    expect(isValidDid(undefined)).to.be.false;
    expect(isValidDid(42)).to.be.false;
  });
});

describe('parseDid', () => {
  it('splits the method and method-specific identifier', () => {
    expect(parseDid('did:web:example.com:user:alice')).to.deep.equal({
      method: 'web',
      methodSpecificId: 'example.com:user:alice'
    });
  });
});

describe('DIDResolutionError', () => {
  it('carries the error type', () => {
    const error = new DIDResolutionError({type: INVALID_DID});
    expect(error.type).to.equal(INVALID_DID);
    expect(error.message).to.equal(INVALID_DID);
  });
});
