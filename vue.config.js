module.exports = {
  /* Changer tout les chemins en relatifs en production (build) */
  baseUrl:
    process.env.NODE_ENV === "production"
      ? "./" // production
      : "/" // dev
};
