const { initTRPC } = require("@trpc/server");
const multer = require("multer");
const path = require("path");

const t = initTRPC.create();
const upload = multer({ dest: path.join(__dirname, "uploads/") });

const appRouter = t.router({
  uploadImage: t.procedure.mutation(async ({ ctx }) => {
    return new Promise((resolve, reject) => {
      upload.array("image")(ctx.req, ctx.res, (err) => {
        if (err) return reject(err);

        if (!ctx.req.files || ctx.req.files.length === 0) {
          return reject(new Error("No files uploaded"));
        }

        const results = ctx.req.files.map((file) => ({
          filename: file.originalname,
          label: "cat",
          confidence: 0.92,
        }));

        resolve(results);
      });
    });
  }),
});

module.exports = { appRouter };
