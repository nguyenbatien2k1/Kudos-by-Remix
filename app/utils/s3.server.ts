import {
  json,
  NodeOnDiskFile,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";

// 1
// const s3 = new S3({
//   region: process.env.KUDOS_BUCKET_REGION,
//   accessKeyId: process.env.KUDOS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.KUDOS_SECRET_ACCESS_KEY,
// });

// const uploadHandler: UploadHandler = async ({
//   name,
//   filename,
//   stream,
// }): Promise<void> => {
//   // 2
//   if (name !== "profile-pic") {
//     stream.resume();
//     return;
//   }

//   // 3
//     const { Location } = await s3
//       .upload({
//         Bucket: process.env.KUDOS_BUCKET_NAME || "",
//         Key: `${cuid()}.${filename.split(".").slice(-1)}`,
//         Body: stream,
//       })
//       .promise();

//   // 4
//     return Location;
// };

const uploadHandler = unstable_composeUploadHandlers(
  unstable_createFileUploadHandler({
    maxPartSize: 5_000_000, // Max 5MB
    directory: "./public/uploads",
    file: ({ filename }) => filename,
  }),
  // parse everything else into memory
  unstable_createMemoryUploadHandler()
);

export async function uploadAvatar(request: Request) {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  let files = formData.getAll("profile-pic") as NodeOnDiskFile[];

  // const file = formData.get("profile-pic") || "";
  // return file;

  return files[0].name.toString();
  //   return json({
  //     files: files.map((file) => ({
  //       name: file.name,
  //       url: `/uploads/${file.name}`,
  //     })),
  //   });
}
