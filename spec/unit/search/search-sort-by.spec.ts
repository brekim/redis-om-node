import '../helpers/mock-client'
import Client from "../../../lib/client";
import { Search, RawSearch } from "../../../lib/search/search";

import {
  SimpleHashEntity, simpleHashSchema, simpleSortableHashSchema,
  SimpleJsonEntity, simpleJsonSchema, simpleSortableJsonSchema
} from "../helpers/test-entity-and-schema";
import {
  mockClientSearchToReturnMultipleHashes as hashMocker,
  mockClientSearchToReturnMultipleJsonStrings as jsonMocker
} from '../helpers/search-helpers';
import { RedisError } from '../../../lib';


const warnSpy = vi.spyOn(global.console, 'warn').mockImplementation(() => {})
const errorSpy = vi.spyOn(global.console, 'error').mockImplementation(() => {})

type HashSearch = Search<SimpleHashEntity> | RawSearch<SimpleHashEntity>;
type JsonSearch = Search<SimpleJsonEntity> | RawSearch<SimpleJsonEntity>;


beforeEach(() => {
  vi.mocked(client.search).mockReset();
});

const client = new Client()

describe.each([
  ["FluentSearch",
    new Search<SimpleHashEntity>(simpleHashSchema, client),
    new Search<SimpleHashEntity>(simpleSortableHashSchema, client),
    new Search<SimpleJsonEntity>(simpleJsonSchema, client),
    new Search<SimpleJsonEntity>(simpleSortableJsonSchema,client)],
  ["RawSearch",
    new RawSearch<SimpleHashEntity>(simpleHashSchema, client),
    new RawSearch<SimpleHashEntity>(simpleSortableHashSchema, client),
    new RawSearch<SimpleJsonEntity>(simpleJsonSchema, client),
    new RawSearch<SimpleJsonEntity>(simpleSortableJsonSchema, client)]
])("%s", (_,
  hashSearch: HashSearch, sortableHashSearch: HashSearch,
  jsonSearch: JsonSearch, sortableJsonSearch: JsonSearch) => {

  describe.each([
    ["on a Hash", sortableHashSearch, hashMocker],
    ["on a JSON Document", sortableJsonSearch, jsonMocker]
  ])("%s", (_, search: HashSearch | JsonSearch, clientMocker) => {

    beforeEach(async () => {
      clientMocker();
    });

    describe("#sortAscending", () => {
      beforeEach(async () => {
        await search.sortAscending('aNumber').return.first();
      });

      it("asks the client for the results with the expected sort options", () => {
        expect(client.search).toHaveBeenCalledWith({
          indexName: expect.stringMatching('Simple(Hash|Json)Entity:index'),
          query: '*',
          limit: { offset: 0, count: 1 },
          sort: { field: 'aNumber', order: 'ASC' },
          keysOnly: false
        });
      });
    });

    describe("#sortAsc", () => {
      beforeEach(async () => {
        await search.sortAsc('aNumber').return.first();
      });

      it("asks the client for the results with the expected sort options", () => {
        expect(client.search).toHaveBeenCalledWith({
          indexName: expect.stringMatching('Simple(Hash|Json)Entity:index'),
          query: '*',
          limit: { offset: 0, count: 1 },
          sort: { field: 'aNumber', order: 'ASC' },
          keysOnly: false
        });
      });
    });

    describe("#sortDescending", () => {
      beforeEach(async () => {
        await search.sortDescending('aNumber').return.first();
      });

      it("asks the client for the results with the expected sort options", () => {
        expect(client.search).toHaveBeenCalledWith({
          indexName: expect.stringMatching('Simple(Hash|Json)Entity:index'),
          query: '*',
          limit: { offset: 0, count: 1 },
          sort: { field: 'aNumber', order: 'DESC' },
          keysOnly: false
        });
      });
    });

    describe("#sortDesc", () => {
      beforeEach(async () => {
        await search.sortDesc('aNumber').return.first();
      });

      it("asks the client for the results with the expected sort options", () => {
        expect(client.search).toHaveBeenCalledWith({
          indexName: expect.stringMatching('Simple(Hash|Json)Entity:index'),
          query: '*',
          limit: { offset: 0, count: 1 },
          sort: { field: 'aNumber', order: 'DESC' },
          keysOnly: false
        });
      });
    });
  });

  describe("#sortBy", () => {
    describe.each([

      ["on a number in a Hash", hashSearch, hashMocker,
        {
          field: 'aNumber', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aNumber', order: 'ASC' },
          expectedWarning: "'sortBy' was called on field 'aNumber' which is not marked as sortable in the Schema. This may result is slower searches. If possible, mark the field as sortable in the Schema."
        }],
      ["on a sortable number in a Hash", sortableHashSearch, hashMocker,
        {
          field: 'aNumber', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aNumber', order: 'ASC' }
        }],
      ["on a number in a JSON Document", jsonSearch, jsonMocker,
        {
          field: 'aNumber', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aNumber', order: 'ASC' },
          expectedWarning: "'sortBy' was called on field 'aNumber' which is not marked as sortable in the Schema. This may result is slower searches. If possible, mark the field as sortable in the Schema."
        }],
      ["on a sortable number in a JSON Document", sortableJsonSearch, jsonMocker,
        {
          field: 'aNumber', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aNumber', order: 'ASC' }
        }],

      ["on a string in a Hash", hashSearch, hashMocker,
        {
          field: 'aString', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aString', order: 'ASC' },
          expectedWarning: "'sortBy' was called on field 'aString' which is not marked as sortable in the Schema. This may result is slower searches. If possible, mark the field as sortable in the Schema."
        }],
      ["on a sortable string in a Hash", sortableHashSearch, hashMocker,
        {
          field: 'aString', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aString', order: 'ASC' }
        }],
      ["on a string in a JSON Document", jsonSearch, jsonMocker,
        {
          field: 'aString', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aString', order: 'ASC' }
        }],
      ["on a sortable string in a JSON Document", sortableJsonSearch, jsonMocker,
        {
          field: 'aString', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aString', order: 'ASC' }
        }],

      ["on a boolean in a Hash", hashSearch, hashMocker,
        {
          field: 'aBoolean', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aBoolean', order: 'ASC' },
          expectedWarning: "'sortBy' was called on field 'aBoolean' which is not marked as sortable in the Schema. This may result is slower searches. If possible, mark the field as sortable in the Schema."
        }],
      ["on a sortable boolean in a Hash", sortableHashSearch, hashMocker,
        {
          field: 'aBoolean', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aBoolean', order: 'ASC' }
        }],
      ["on a boolean in a JSON Document", jsonSearch, jsonMocker,
        {
          field: 'aBoolean', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aBoolean', order: 'ASC' }
        }],
      ["on a sortable boolean in a JSON Document", sortableJsonSearch, jsonMocker,
        {
          field: 'aBoolean', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aBoolean', order: 'ASC' }
        }],

      ["on a text in a Hash", hashSearch, hashMocker,
        {
          field: 'someText', sortOrder: 'ASC',
          expectedSortOptions: { field: 'someText', order: 'ASC' },
          expectedWarning: "'sortBy' was called on field 'someText' which is not marked as sortable in the Schema. This may result is slower searches. If possible, mark the field as sortable in the Schema."
        }],
      ["on a sortable text in a Hash", sortableHashSearch, hashMocker,
        {
          field: 'someText', sortOrder: 'ASC',
          expectedSortOptions: { field: 'someText', order: 'ASC' }
        }],
      ["on a text in a JSON Document", jsonSearch, jsonMocker,
        {
          field: 'someText', sortOrder: 'ASC',
          expectedSortOptions: { field: 'someText', order: 'ASC' },
          expectedWarning: "'sortBy' was called on field 'someText' which is not marked as sortable in the Schema. This may result is slower searches. If possible, mark the field as sortable in the Schema."
        }],
      ["on a sortable text in a JSON Document", sortableJsonSearch, jsonMocker,
        {
          field: 'someText', sortOrder: 'ASC',
          expectedSortOptions: { field: 'someText', order: 'ASC' }
        }],

      ["on a point in a Hash", hashSearch, hashMocker,
        {
          field: 'aPoint', sortOrder: 'ASC',
          expectedError: "'sortBy' was called on 'point' field 'aPoint' which cannot be sorted."
        }],
      ["on a point in a JSON Document", jsonSearch, jsonMocker,
        {
          field: 'aPoint', sortOrder: 'ASC',
          expectedError: "'sortBy' was called on 'point' field 'aPoint' which cannot be sorted."
        }],

      ["on a date in a Hash", hashSearch, hashMocker,
        {
          field: 'aDate', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aDate', order: 'ASC' },
          expectedWarning: "'sortBy' was called on field 'aDate' which is not marked as sortable in the Schema. This may result is slower searches. If possible, mark the field as sortable in the Schema."
        }],
      ["on a sortable date in a Hash", sortableHashSearch, hashMocker,
        {
          field: 'aDate', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aDate', order: 'ASC' }
        }],
      ["on a date in a JSON Document", jsonSearch, jsonMocker,
        {
          field: 'aDate', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aDate', order: 'ASC' },
          expectedWarning: "'sortBy' was called on field 'aDate' which is not marked as sortable in the Schema. This may result is slower searches. If possible, mark the field as sortable in the Schema."
        }],
      ["on a sortable date in a JSON Document", sortableJsonSearch, jsonMocker,
        {
          field: 'aDate', sortOrder: 'ASC',
          expectedSortOptions: { field: 'aDate', order: 'ASC' }
        }],

      ["on a array in a Hash", hashSearch, hashMocker,
        {
          field: 'someStrings', sortOrder: 'ASC',
          expectedError: "'sortBy' was called on 'string[]' field 'someStrings' which cannot be sorted."
        }],
      ["on a array in a JSON Document", jsonSearch, jsonMocker,
        {
          field: 'someStrings', sortOrder: 'ASC',
          expectedError: "'sortBy' was called on 'string[]' field 'someStrings' which cannot be sorted."
        }],

      ["on an invalid field in a Hash", hashSearch, hashMocker,
        {
          field: 'somethingMissing', sortOrder: 'ASC',
          expectedError: "'sortBy' was called on field 'somethingMissing' which is not defined in the Schema."
        }],
      ["on an invalid field in a JSON Document", jsonSearch, jsonMocker,
        {
          field: 'somethingMissing', sortOrder: 'ASC',
          expectedError: "'sortBy' was called on field 'somethingMissing' which is not defined in the Schema."
        }]

    ])("%s", (_, search: HashSearch | JsonSearch, clientMocker, data: any) => {

      let field = data.field;
      let order = data.sortOrder;
      let expectedSortOptions = data.expectedSortOptions;
      let expectedWarning = data.expectedWarning;
      let expectedError = data.expectedError;
      let actualError: RedisError;

      beforeEach(async () => {
        clientMocker();
        try {
          await search.sortBy(field, order).return.first();
        } catch (error) {
          actualError = error as RedisError;
        }
      });

      if (expectedError) {
        it("logs and throws an error", () => {
          expect(actualError!.message).toBe(expectedError);
          expect(errorSpy).toHaveBeenCalledWith(expectedError);
        });
        return;
      }

      it("does not generate an error", () => {
        if (actualError) console.log(actualError)
        expect(actualError).toBeUndefined();
        expect(errorSpy).not.toHaveBeenCalled();
      });

      it("asks the client for the results with the expected sort options", () => {
        expect(client.search).toHaveBeenCalledWith({
          indexName: expect.stringMatching('Simple(Hash|Json)Entity:index'),
          query: '*',
          limit: { offset: 0, count: 1 },
          sort: expectedSortOptions,
          keysOnly: false
        });
      });

      if (expectedWarning) {
        it("generates the expected warning", () => {
          expect(warnSpy).toHaveBeenCalledWith(expectedWarning);
        });
      } else {
        it("does not generate a warning", () => {
          expect(warnSpy).not.toHaveBeenCalled();
        });
      }
    });
  });
});
