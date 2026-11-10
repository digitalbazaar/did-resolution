/*
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */

import {describe, it} from 'mocha';
import {expandRelativeUrls} from '../lib/relative-urls.js';
import {expect} from 'chai';
import {resolve} from '../lib/resolve.js';

const DID = 'did:example:123';

describe('expandRelativeUrls', () => {
  it('expands fragment, path, and query references against the DID', () => {
    const doc = {
      id: DID,
      verificationMethod: [{id: '#key-1', type: 'Multikey'}],
      authentication: ['#key-1', 'did:example:other#key-2'],
      service: [{id: '#svc', type: 'X'}, {id: '/path', type: 'Y'}]
    };
    const out = expandRelativeUrls(doc, DID);
    expect(out.verificationMethod[0].id).to.equal(`${DID}#key-1`);
    expect(out.authentication).to.deep.equal([
      `${DID}#key-1`, 'did:example:other#key-2'
    ]);
    expect(out.service[0].id).to.equal(`${DID}#svc`);
    expect(out.service[1].id).to.equal(`${DID}/path`);
  });

  it('expands object references in verification relationships', () => {
    const doc = {id: DID, assertionMethod: [{id: '?v=1', type: 'Multikey'}]};
    expect(expandRelativeUrls(doc, DID).assertionMethod[0].id)
      .to.equal(`${DID}?v=1`);
  });

  it('leaves absolute references unchanged', () => {
    const doc = {
      id: DID,
      verificationMethod: [{id: 'did:example:other#k', type: 'Multikey'}]
    };
    expect(expandRelativeUrls(doc, DID).verificationMethod[0].id)
      .to.equal('did:example:other#k');
  });

  it('does not change the input document', () => {
    const doc = {id: DID, authentication: ['#key-1']};
    expandRelativeUrls(doc, DID);
    expect(doc.authentication).to.deep.equal(['#key-1']);
  });
});

describe('resolve with expandRelativeUrls', () => {
  it('expands references in the returned document', async () => {
    const result = await resolve(DID, {
      resolutionOptions: {expandRelativeUrls: true},
      methods: {example: {resolve: async () => ({
        didDocument: {id: DID, authentication: ['#key-1']},
        didDocumentMetadata: {}
      })}}
    });
    expect(result.didDocument.authentication).to.deep.equal([`${DID}#key-1`]);
  });

  it('leaves references alone when the option is absent', async () => {
    const result = await resolve(DID, {
      methods: {example: {resolve: async () => ({
        didDocument: {id: DID, authentication: ['#key-1']},
        didDocumentMetadata: {}
      })}}
    });
    expect(result.didDocument.authentication).to.deep.equal(['#key-1']);
  });
});
