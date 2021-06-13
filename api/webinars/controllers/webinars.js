"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  //create event with linked user
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.services.webinars.create(data, { files });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.services.webinars.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.webinars });
  },

  //update user event
  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [webinars] = await strapi.services.webinars.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!webinars) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.webinars.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.webinars.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.webinars });
  },

  //Delete a user event
  async delete(ctx) {
    const { id } = ctx.params;

    const [webinars] = await strapi.services.webinars.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!webinars) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    const entity = await strapi.services.webinars.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.webinars });
  },
  //Get logged in users
  async me(ctx) {
    const user = ctx.state.user; //gets the user

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorisation header was found" }] },
      ]);
    }

    const data = await strapi.services.webinars.find({ user: user.id }); //get specific user's webinars

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.webinars });
  },
};
