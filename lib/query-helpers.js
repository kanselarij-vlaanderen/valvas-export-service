import request from 'request';
import { queryKaleidos } from './kaleidos';
import { update, sparqlEscapeUri } from 'mu';

/**
 * Executes a CONSTRUCT query on Kaleidos and inserts the resulting triples
 * in a given graph of the internal triple store.
 *
 * @param [string} query Construct query to execute on the Kaleidos triple store
 * @param {string} graph URI of the graph to insert the resulting triples in
*/
async function copyToLocalGraph(query, graph) {
  try {
    const triples = await constructTriples(query);
    const insertQuery = `
      INSERT DATA {
        GRAPH ${sparqlEscapeUri(graph)} {
          ${triples}
        }
      }
    `;
    await update(insertQuery);
  } catch (e) {
    console.log(`Something went wrong while executing query: ${query}. Nothing inserted in the store.`);
    console.log(e);
    throw e;
  }
}

async function constructTriples(query) {
  const format = 'text/plain'; // N-triples format
  const options = {
    method: 'POST',
    url: process.env.KALEIDOS_SPARQL_ENDPOINT,
    headers: {
      'Accept': format
    },
    qs: {
      format: format,
      query: query
    }
  };

  return new Promise ( (resolve,reject) => {
    return request(options, function(error, response, body) {
      if (error)
        reject(error);
      else
        resolve(body);
    });
  });

}

export {
  copyToLocalGraph
}