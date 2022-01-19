// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// }); gc fire

const functions = require('firebase-functions');
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();
const BUCKET_NAME = process.env.BUCKET_NAME

// Replace BUCKET_NAME
const bucket = `gs://${BUCKET_NAME}`;

exports.scheduledFirestoreExport = functions.pubsub
                                            .schedule('every 24 hours')
                                            .onRun((context) => {

  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  const databaseName = 
    client.databasePath(projectId, '(default)');

  return client.exportDocuments({
    name: databaseName,
    outputUriPrefix: bucket,
    // Leave collectionIds empty to export all collections
    // or set to a list of collection IDs to export,
    // collectionIds: ['users', 'posts']
    collectionIds: []
    })
  .then(responses => {
    const response = responses[0];
    console.log(`Operation Name: ${response['name']}`);
  })
  .catch(err => {
    console.error(err);
    throw new Error('Export operation failed');
  });
});
