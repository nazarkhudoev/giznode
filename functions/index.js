/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// !========= NEW CODE =======
const express = require("express");
const functionsPack = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const {v4: uuidv4} = require("uuid");
const cookiePack = require("cookie");
// const fs = require("fs");
const {Storage} = require("@google-cloud/storage");
// ? ======================== Use admin permissions

const serviceAccount = require("./permission.json");
// const {object} = require("firebase-functions/v1/storage");
// const {log} = require("console");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// ? ======================= Settings
const expressServe = express();
const DataBase = admin.firestore();
const CorsOptions = {
  credentials: true,
  origin: "http://127.0.0.1:5173",
  // exposedHeaders: ["set-Cookie"],
  optionsSuccessStatus: 200,
};
expressServe.use(cors(CorsOptions));

// console.log('Generated Unique ID:', uniqueId);
// * ======================== Routes

function saveFile(reqBody) {
  // ! GenId for file
  const randIdForImage = String(
      Number(String(Math.random()).split(".")[1]) / 1000000,
  ).split(".")[0];
    // ! save file locally
    // const buffer = Buffer.from(reqBody.byte, "base64")
    // const pathForSave = './static/' + randIdForImage + '.jpeg'
    // fs.writeFile(pathForSave, buffer, err => {
    //     if (err) {
    //         console.error(err);
    //     }else{
    //         console.error("file saved");
    //     }
    //     // file written successfully
    // });
    // ! save file locally
    // ! save file in storage
  const projectId = "giznew-4a7d6";
  const keyFilename = "./permission.json";
  // const bucketName = 'giz_bucket';
  const bucketName = "gs://giznew-4a7d6.appspot.com";
  const storage = new Storage({
    projectId,
    keyFilename,
  });
  const fileOptions = {
    contentType: "image/jpeg",
  };
  const buffer = Buffer.from(reqBody.byte, "base64");
  const pathForSave = randIdForImage + ".jpeg";

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(pathForSave);

  file.save(buffer, fileOptions, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("success");
      // console.log(file);
      // console.log("success");
    }
  });
  return randIdForImage;
}
async function getMedia(urlfromDb) {
  console.log(urlfromDb);
  // (async () => {
  // ! Generate access token
  const projectId = "giznew-4a7d6";
  const keyFilename = "./permission.json";
  const bucketName = "gs://giznew-4a7d6.appspot.com";
  const storage = new Storage({
    projectId,
    keyFilename,
  });

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(urlfromDb);
  const expiration = Date.now() + 3600000;
  try {
    const [signUrls] = await file.getSignedUrl({
      action: "read",
      expires: expiration,
    });
    console.log(signUrls);
    return signUrls;
  } catch (err) {
    console.log(err);
    return null;
  }
}
// ! Create Village ::: Maybe not needed
expressServe.post("/create/village", (req, res) => {
  (async () => {
    try {
      const cookieParse = cookiePack.parse(req.headers.cookie).token;
      try {
        const verify = await admin.auth().verifyIdToken(cookieParse, true);
        const TimeNow = Math.floor(Date.now() / 1000);
        const uniqueId = uuidv4();

        if (verify.exp < TimeNow) {
          return res.status(400).send("YOUR_LINK_EXPIRED");
        } else {
          await DataBase.collection("village")
              .doc("/" + uniqueId + "/")
              .create({
                id: uniqueId,
                name_ru: req.body.name_ru,
                name_tj: req.body.name_tj,
                name_en: req.body.name_en,
                name_de: req.body.name_de,
                district_id: req.body.district_id,
                coordinates: req.body.coordinates,
              });
          return res.status(200).send("SUCCEDED");
        }
      } catch (err) {
        return res.status(400).send("ERROR_WITH_VALIDATING" + ":" + err);
      }
    } catch (err) {
      return res.status(400).send("NO_COOKIE" + ":" + err);
    }
  })();
});
// ! Create District ::: Maybe not needed
expressServe.post("/create/districts", (req, res) => {
  (async () => {
    try {
      const cookieParse = cookiePack.parse(req.headers.cookie).token;
      try {
        const verify = await admin.auth().verifyIdToken(cookieParse, true);
        const TimeNow = Math.floor(Date.now() / 1000);
        const uniqueId = uuidv4();

        if (verify.exp < TimeNow) {
          return res.status(400).send("YOUR_LINK_EXPIRED");
        } else {
          await DataBase.collection("districts")
              .doc("/" + uniqueId + "/")
              .create({
                id: uniqueId,
                name_ru: req.body.name_ru,
                name_tj: req.body.name_tj,
                name_en: req.body.name_en,
                name_de: req.body.name_de,
                district_id: req.body.district_id,
              });
          return res.status(200).send("SUCCEDED");
        }
      } catch (err) {
        return res.status(400).send("ERROR_WITH_VALIDATING" + ":" + err);
      }
    } catch (err) {
      return res.status(400).send("NO_COOKIE" + ":" + err);
    }
  })();
});
// ? Create Project
// * DONE
expressServe.post("/create/project", (req, res) => {
  (async () => {
    try {
      const cookieParse = cookiePack.parse(req.headers.cookie).token;
      console.log(cookieParse);
      try {
        const verify = await admin.auth().verifyIdToken(cookieParse, true);
        console.log(verify);
        const TimeNow = Math.floor(Date.now() / 1000);
        console.log(TimeNow);
        console.log(verify.exp);
        console.log(verify.iat);
        console.log(verify.exp > TimeNow);
        const uniqueId = uuidv4();
        const reqBody = req.body;
        const parsedData = JSON.parse(reqBody.data);
        console.log(parsedData);

        if (verify.exp >= TimeNow) {
          const randIdForImage = saveFile(reqBody);
          // DataBase.settings({ignoreUndefinedProperties})

          await DataBase.collection("projects")
              .doc("/" + uniqueId + "/")
              .create({
                project_id: uniqueId,
                name_ru: parsedData.name_ru,
                name_tj: parsedData.name_tj,
                name_en: parsedData.name_en,
                name_de: parsedData.name_de,
                short_ru: parsedData.short_ru,
                short_tj: parsedData.short_tj,
                short_en: parsedData.short_en,
                short_de: parsedData.short_de,
                category_id: parsedData.category_id,
                banner_url: randIdForImage + ".jpeg",
                implementation: parsedData.implementation,
                location: parsedData.location,
                district_id: parsedData.district_id,
                village_id: parsedData.village_id,
                adress_ru: parsedData.adress_ru,
                adress_tj: parsedData.adress_tj,
                adress_en: parsedData.adress_en,
                adress_de: parsedData.adress_de,
                created_at: parsedData.created_at,
                updated_at: parsedData.updated_at,
              });
          return res.status(200).send("SUCCEDED");
        } else {
          return res.status(400).send("YOUR_LINK_EXPIRED");
        }
      } catch (err) {
        return res.status(400).send("ERROR_WITH_VALIDATING" + err);
      }
    } catch (err) {
      return res.status(400).send("NO_COOKIE" + ":" + err);
    }
  })();
});
// * DONE
expressServe.post("/create/media", (req, res) => {
  (async () => {
    try {
      const cookieParse = cookiePack.parse(req.headers.cookie).token;
      try {
        const verify = await admin.auth().verifyIdToken(cookieParse, true);
        const TimeNow = Math.floor(Date.now() / 1000);
        const uniqueId = uuidv4();

        if (verify.exp >= TimeNow) {
          // console.log(req.body.byte);
          const reqBody = req.body;
          const parsedData = JSON.parse(reqBody.data);
          // console.log(reqBody.byte);
          const randIdForImage = saveFile(reqBody);
          console.log(randIdForImage);

          // ! save file in storage
          await DataBase.collection("media")
              .doc("/" + uniqueId + "/")
              .create({
                media_id: uniqueId,
                type: parsedData.type,
                project_id: parsedData.project_id,
                title_ru: parsedData.title_ru,
                title_tj: parsedData.title_tj,
                title_en: parsedData.title_en,
                title_de: parsedData.title_de,
                url: randIdForImage + ".jpeg",
              });
          return res.status(200).send("SUCCEDED");
        } else {
          return res.status(400).send("YOUR_LINK_EXPIRED");
        }
      } catch (err) {
        return res.status(400).send("ERROR_WITH_VALIDATING" + err);
      }
    } catch (err) {
      return res.status(400).send("NO_COOKIE" + ":" + err);
    }
  })();
});
// ? Create Links
// * DONE
expressServe.post("/create/links", (req, res) => {
  (async () => {
    try {
      const cookieParse = cookiePack.parse(req.headers.cookie).token;
      try {
        const verify = await admin.auth().verifyIdToken(cookieParse, true);
        const TimeNow = Math.floor(Date.now() / 1000);
        const uniqueId = uuidv4();

        if (verify.exp >= TimeNow) {
          await DataBase.collection("extra_links")
              .doc("/" + req.body.project_id + "/")
              .create({
                project_id: req.body.project_id,
                link_id: uniqueId,
                title_ru: req.body.title_ru,
                title_tj: req.body.title_tj,
                title_en: req.body.title_en,
                title_de: req.body.title_de,
                url: req.body.url,
              });
          return res.status(200).send("SUCCEDED");
        } else {
          return res.status(400).send("YOUR_LINK_EXPIRED");
        }
      } catch (err) {
        return res.status(400).send("ERROR_WITH_VALIDATING" + ":" + err);
      }
    } catch (err) {
      return res.status(400).send("NO_COOKIE" + ":" + err);
    }
  })();
});
// ? Create Catigories
// * DONE
expressServe.post("/create/categories", (req, res) => {
  (async () => {
    try {
      const cookieParse = cookiePack.parse(req.headers.cookie).token;
      try {
        const verify = await admin.auth().verifyIdToken(cookieParse, true);
        const TimeNow = Math.floor(Date.now() / 1000);
        const uniqueId = uuidv4();

        if (verify.exp >= TimeNow) {
          await DataBase.collection("categories")
              .doc("/" + uniqueId + "/")
              .create({
                categories_id: uniqueId,
                name_ru: req.body.name_ru,
                name_tj: req.body.name_tj,
                name_en: req.body.name_en,
                name_de: req.body.name_de,
                created_at: req.body.created_at,
                updated_at: req.body.updated_at,
              });
          return res.status(200).send("SUCCEDED");
        } else {
          return res.status(400).send("YOUR_LINK_EXPIRED");
        }
      } catch (err) {
        return res.status(400).send("ERROR_WITH_VALIDATING" + ":" + err);
      }
    } catch (err) {
      return res.status(400).send("NO_COOKIE" + ":" + err);
    }
  })();
});
// ? Updates for project
// * DONE
expressServe.post("/update/project/:id", (req, res) => {
  (async () => {
    try {
      const cookieParse = cookiePack.parse(req.headers.cookie).token;
      try {
        const verify = await admin.auth().verifyIdToken(cookieParse, true);
        const TimeNow = Math.floor(Date.now() / 1000);

        if (verify.exp >= TimeNow) {
          const body = req.body;
          await DataBase.collection("projects").doc(req.params.id).update(body);
          return res.status(200).send("SUCCEDED");
        } else {
          return res.status(400).send("YOUR_LINK_EXPIRED");
        }
      } catch (err) {
        return res.status(400).send("ERROR_WITH_VALIDATING" + ":" + err);
      }
    } catch (err) {
      return res.status(400).send("NO_COOKIE" + ":" + err);
    }
  })();
});
// * DONE
// ? Updates for media
expressServe.post("/update/media/:id", (req, res) => {
  (async () => {
    try {
      const cookieParse = cookiePack.parse(req.headers.cookie).token;
      try {
        const verify = await admin.auth().verifyIdToken(cookieParse, true);
        const TimeNow = Math.floor(Date.now() / 1000);

        if (verify.exp >= TimeNow) {
          const body = req.body;
          const replaceBody = {
            title_de: body.title_de,
            title_en: body.title_en,
            title_ru: body.title_ru,
            title_tj: body.title_tj,
          };
          await DataBase.collection("media")
              .doc(req.params.id)
              .update(replaceBody);
          return res.status(200).send("SUCCEDED");
        } else {
          return res.status(400).send("YOUR_LINK_EXPIRED");
        }
      } catch (err) {
        return res.status(400).send("ERROR_WITH_VALIDATING" + ":" + err);
      }
    } catch (err) {
      return res.status(400).send("NO_COOKIE" + ":" + err);
    }
  })();
});
// ? Updates for extra links
// * DONE
expressServe.post("/update/links/:id", (req, res) => {
  (async () => {
    try {
      const cookieParse = cookiePack.parse(req.headers.cookie).token;
      try {
        const verify = await admin.auth().verifyIdToken(cookieParse, true);
        const TimeNow = Math.floor(Date.now() / 1000);

        if (verify.exp >= TimeNow) {
          const body = req.body;
          await DataBase.collection("extra_links")
              .doc(req.params.id)
              .update(body);
          return res.status(200).send("SUCCEDED");
        } else {
          return res.status(400).send("YOUR_LINK_EXPIRED");
        }
      } catch (err) {
        return res.status(400).send("ERROR_WITH_VALIDATING" + ":" + err);
      }
    } catch (err) {
      return res.status(400).send("NO_COOKIE" + ":" + err);
    }
  })();
});
// ? Get project by id
// * DONE
expressServe.get("/get/project/:id", (req, res) => {
  (async () => {
    try {
      const test = getMedia("as");
      console.log(test);
      const dataFromUSer = (
        await DataBase.collection("projects").doc(req.params.id).get()
      ).data();
      const bannerUrl = await getMedia(dataFromUSer.banner_url);
      console.log("asd");
      console.log(bannerUrl);
      dataFromUSer.banner_url = bannerUrl;
      console.log(dataFromUSer.banner_url);
      return res.status(200).send(dataFromUSer);
    } catch (err) {
      return res.status(400).send("NO_PROJECT_FOUND" + ":" + err);
    }
  })();
});
// ? Get project with url
// * DONE
expressServe.get("/get/project", (req, res) => {
  (async () => {
    try {
      const array = [];
      const arrayForSend = [];
      await DataBase.collection("projects")
          .get()
          .then((queryFromDB) => {
            const docFromDB = queryFromDB.docs;
            for (const document of docFromDB) {
              // ? Send it to user
              const select = {
                project_id: document.data().project_id,
                name_ru: document.data().name_ru,
                name_tj: document.data().name_tj,
                name_en: document.data().name_en,
                name_de: document.data().name_de,
                short_ru: document.data().short_ru,
                short_tj: document.data().short_tj,
                short_en: document.data().short_en,
                short_de: document.data().short_de,
                category_id: document.data().category_id,
                banner_url: document.data().banner_url,
                implementation: document.data().urlimplementation,
                location: document.data().urllocation,
                district_id: document.data().district_id,
                village_id: document.data().village_id,
                adress_ru: document.data().adress_ru,
                adress_tj: document.data().adress_tj,
                adress_en: document.data().adress_en,
                adress_de: document.data().adress_de,
                created_at: document.data().created_at,
                updated_at: document.data().updated_at,
              };
              array.push(select);
            }
          });

      for (const item of array) {
        console.log(item.banner_url);
        const mediaLink = await getMedia(item.banner_url);
        item.banner_url = mediaLink;
        arrayForSend.push(item);
      }
      return res.status(200).send(arrayForSend);
    } catch (err) {
      return res.status(400).send("NO_PROJECT_FOUND"+":"+err);
    }
  })();
});
// ? Get media by id
// * DONE
expressServe.get("/get/media/:id", (req, res) => {
  (async () => {
    try {
      const array = [];
      const arrayForSend = [];
      const dataFromUSer = await DataBase.collection("media")
          .where("project_id", "==", req.params.id)
          .get()
          .then((queryFromDB) => {
            const docFromDB = queryFromDB.docs;
            for (const document of docFromDB) {
              // ? Send it to user
              const select = {
                project_id: document.data().project_id,
                title_en: document.data().title_en,
                title_de: document.data().title_de,
                title_ru: document.data().title_ru,
                title_tj: document.data().title_tj,
                type: document.data().type,
                url: document.data().url,
              };
              array.push(select);
            }
          });
      console.log(dataFromUSer);

      for (const item of array) {
        const mediaLink = await getMedia(item.url);
        item.url = mediaLink;
        arrayForSend.push(item);
      }
      return res.status(200).send(arrayForSend);
    } catch (err) {
      console.log(err);
      return res.status(400).send("NO_MEDIA_FOUND");
    }
  })();
});
// ? Get links by id
// * DONE
expressServe.get("/get/links/:id", (req, res) => {
  (async () => {
    try {
      const ArreyForSend = [];
      const dataFromUSer = await DataBase.collection("extra_links")
          .where("project_id", "==", req.params.id)
          .get()
          .then((queryData) => {
            const dataQueryDb = queryData.docs;
            for (const item of dataQueryDb) {
              console.log(item);
              const Object = {
                project_id: item.data().project_id,
                title_ru: item.data().title_ru,
                title_tj: item.data().title_tj,
                title_en: item.data().title_en,
                title_de: item.data().title_de,
                url: item.data().url,
              };
              ArreyForSend.push(Object);
            }
          });
      console.log(dataFromUSer);
      return res.status(200).send(ArreyForSend);
    } catch (err) {
      return res.status(400).send("NO_EXTRA_LINKS_FOUND" + ":" + err);
    }
  })();
});
// ? Get categories all
// * DONE
expressServe.get("/get/categories", (req, res) => {
  (async () => {
    try {
      const ArrayToSend = [];
      const dataFromUSer = await DataBase.collection("categories")
          .get()
          .then((queryData) => {
            const dataVar = queryData.docs;
            for (const item of dataVar) {
              const ObjectFromData = {
                categories_id: item.data().categories_id,
                name_ru: item.data().name_ru,
                name_tj: item.data().name_tj,
                name_en: item.data().name_en,
                name_de: item.data().name_de,
                created_at: item.data().created_at,
                updated_at: item.data().updated_at,
              };
              ArrayToSend.push(ObjectFromData);
            }
          });
      console.log(dataFromUSer);
      return res.status(200).send(ArrayToSend);
    } catch (err) {
      return res.status(400).send("NO_CATEGORY_FOUND" + ":" + err);
    }
  })();
});

// !================================================
// catigories --- no update np delete
// projects ---- all update all delete
// media -- only title update and delete
// extra_link --- all delete all delete

exports.expressServe = functionsPack.https.onRequest(expressServe);

