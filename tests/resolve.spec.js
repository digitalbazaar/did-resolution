/*
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */

import {describe, it} from 'mocha';
import {
  DIDResolutionError, FEATURE_NOT_SUPPORTED, INTERNAL_ERROR, INVALID_DID,
  INVALID_DID_DOCUMENT, INVALID_OPTIONS, METHOD_NOT_SUPPORTED, NOT_FOUND
} from '../lib/errors.js';
import {expect} from 'chai';
import {resolve} from '../lib/resolve.js';

const DID = 'did:example:123';
const DOC = {id: DID, verificationMethod: []};

const driver = outcome => ({
  resolve: async () => {
    if(outcome instanceof Error) {
      throw outcome;
    }
    return outcome;
  }
});
const methods = (outcome = {didDocument: DOC, didDocumentMetadata: {}}) =>
  ({example: driver(outcome)});

const errorType = result => result.didResolutionMetadata.error?.type;

describe('resolve (Section 4)', () => {
  it('returns the document with a default content type', async () => {
    const result = await resolve(DID, {methods: methods()});
    expect(result).to.deep.equal({
      didResolutionMetadata: {contentType: 'application/did+ld+json'},
      didDocument: DOC,
      didDocumentMetadata: {}
    });
  });

  it('uses an Accept value that names a DID representation', async () => {
    const result = await resolve(DID, {
      resolutionOptions: {accept: 'application/did+json'},
      methods: methods()
    });
    expect(result.didResolutionMetadata.contentType)
      .to.equal('application/did+json');
  });

  it('falls back to the default for other Accept values', async () => {
    const result = await resolve(DID, {
      resolutionOptions: {accept: 'text/html'},
      methods: methods()
    });
    expect(result.didResolutionMetadata.contentType)
      .to.equal('application/did+ld+json');
  });

  it('returns INVALID_DID for a malformed DID', async () => {
    const result = await resolve('not-a-did', {methods: methods()});
    expect(errorType(result)).to.equal(INVALID_DID);
    expect(result.didDocument).to.be.null;
    expect(result.didDocumentMetadata).to.deep.equal({});
  });

  it('returns METHOD_NOT_SUPPORTED for a method with no driver', async () => {
    const result = await resolve('did:other:123', {methods: methods()});
    expect(errorType(result)).to.equal(METHOD_NOT_SUPPORTED);
  });

  it('returns FEATURE_NOT_SUPPORTED for an unknown option', async () => {
    const result = await resolve(DID, {
      resolutionOptions: {unknownOption: true},
      methods: methods()
    });
    expect(errorType(result)).to.equal(FEATURE_NOT_SUPPORTED);
  });

  it('returns FEATURE_NOT_SUPPORTED for expandRelativeUrls', async () => {
    const result = await resolve(DID, {
      resolutionOptions: {expandRelativeUrls: true},
      methods: methods()
    });
    expect(errorType(result)).to.equal(FEATURE_NOT_SUPPORTED);
  });

  it('returns INVALID_OPTIONS for a value of the wrong type', async () => {
    const result = await resolve(DID, {
      resolutionOptions: {accept: 42},
      methods: methods()
    });
    expect(errorType(result)).to.equal(INVALID_OPTIONS);
  });

  it('returns INVALID_OPTIONS for an invalid versionTime', async () => {
    const result = await resolve(DID, {
      resolutionOptions: {versionTime: 'yesterday'},
      methods: methods()
    });
    expect(errorType(result)).to.equal(INVALID_OPTIONS);
  });

  it('passes the options to the driver', async () => {
    let received;
    const result = await resolve(DID, {
      resolutionOptions: {versionId: 'v2'},
      methods: {example: {resolve: async (did, options) => {
        received = options;
        return {didDocument: DOC, didDocumentMetadata: {}};
      }}}
    });
    expect(received).to.deep.equal({versionId: 'v2'});
    expect(result.didDocument).to.equal(DOC);
  });

  it('reports NOT_FOUND thrown by the driver', async () => {
    const result = await resolve(DID, {
      methods: methods(new DIDResolutionError({type: NOT_FOUND}))
    });
    expect(errorType(result)).to.equal(NOT_FOUND);
    expect(result.didDocument).to.be.null;
  });

  it('returns a deactivated result with a null document', async () => {
    const result = await resolve(DID, {
      methods: methods({
        didDocument: null,
        didDocumentMetadata: {deactivated: true}
      })
    });
    expect(result.didResolutionMetadata.error).to.be.undefined;
    expect(result.didDocument).to.be.null;
    expect(result.didDocumentMetadata).to.deep.equal({deactivated: true});
  });

  it('returns INVALID_DID_DOCUMENT when the id is not the DID', async () => {
    const result = await resolve(DID, {
      methods: methods({
        didDocument: {id: 'did:example:other'},
        didDocumentMetadata: {}
      })
    });
    expect(errorType(result)).to.equal(INVALID_DID_DOCUMENT);
  });

  it('returns INTERNAL_ERROR for an unexpected driver failure', async () => {
    const result = await resolve(DID, {
      methods: methods(new Error('database down'))
    });
    expect(errorType(result)).to.equal(INTERNAL_ERROR);
  });
});
