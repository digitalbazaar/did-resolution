/*
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */

import {describe, it} from 'mocha';
import {
  DIDResolutionError, NOT_FOUND
} from '../lib/errors.js';
import {driver as didKeyDriver} from '@digitalbazaar/did-method-key';
import {expect} from 'chai';
import {resolve} from '../lib/resolve.js';

// The did:key driver from @digitalbazaar/did-method-key, adapted to the driver
// interface resolve() expects. Its failures become NOT_FOUND.
const keyDriver = didKeyDriver();
const methods = {
  key: {
    resolve: async did => {
      try {
        const didDocument = await keyDriver.get({did});
        return {didDocument, didDocumentMetadata: {}};
      } catch(error) {
        throw new DIDResolutionError({type: NOT_FOUND, message: error.message});
      }
    }
  }
};

const DID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';

describe('resolve with the did:key driver', () => {
  it('resolves a did:key to a DID document with the same id', async () => {
    const result = await resolve(DID, {methods});
    expect(result.didResolutionMetadata.error).to.be.undefined;
    expect(result.didDocument.id).to.equal(DID);
    expect(result.didDocument.verificationMethod).to.have.lengthOf.at.least(1);
  });

  it('reports NOT_FOUND for a did:key the driver cannot resolve', async () => {
    const result = await resolve('did:key:z6Mkinvalid', {methods});
    expect(result.didResolutionMetadata.error.type)
      .to.equal('https://www.w3.org/ns/did#NOT_FOUND');
    expect(result.didDocument).to.be.null;
  });
});
