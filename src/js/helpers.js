import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          /** 1st Option -> Method */
          method: 'POST',
          /** 2nd Option -> Header
           *  - Is a snippets of text
           *  - Which are like information about the request itself
           *  - The one we need to define is content type
           *  - application/json
           *    -> We tell the API that the data we send is going to be JSON format
           *    -> Only then API can correctly accept data and create new recipe in the database
           */
          headers: {
            'Content-Type': 'application/json',
          },
          /** 3rd Option: Payload of the request
           *  - The data that we want to send
           *  - body must be in JSON
           *  - Convert the data that we going to send using JSON.stringify
           */
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    /** Model: FETCH API */
    // Using fetch function here will return a promise
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    // Convert the response to JSON -> Response object
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    // This data will become the resolved value of this promise
    return data;
  } catch (err) {
    throw err;
  }
};

/** GET JSON */
// export const getJSON = async function (url) {
//   try {
//     const fetchPro = fetch(url);

//     /** Model: FETCH API */
//     // Using fetch function here will return a promise
//     const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

//     // Convert the response to JSON -> Response object
//     const data = await res.json();

//     if (!res.ok) throw new Error(`${data.message} (${res.status})`);

//     // This data will become the resolved value of this promise
//     return data;
//   } catch (err) {
//     throw err;
//   }
// };

/** SEND JSON */
// export const sendJSON = async function (url, uploadData) {
//   try {
//     /** SENDING JSON TO API MUST COME WITH AN OBJECT */
//     const fetchPro = fetch(url, {
//       /** 1st Option -> Method */
//       method: 'POST',
//       /** 2nd Option -> Header
//        *  - Is a snippets of text
//        *  - Which are like information about the request itself
//        *  - The one we need to define is content type
//        *  - application/json
//        *    -> We tell the API that the data we send is going to be JSON format
//        *    -> Only then API can correctly accept data and create new recipe in the database
//        */
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       /** 3rd Option: Payload of the request
//        *  - The data that we want to send
//        *  - body must be in JSON
//        *  - Convert the data that we going to send using JSON.stringify
//        */
//       body: JSON.stringify(uploadData),
//     });

//     /** Model: FETCH API */
//     // Using fetch function here will return a promise
//     const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

//     // Convert the response to JSON -> Response object
//     const data = await res.json();

//     if (!res.ok) throw new Error(`${data.message} (${res.status})`);

//     // This data will become the resolved value of this promise
//     return data;
//   } catch (err) {
//     throw err;
//   }
// };
