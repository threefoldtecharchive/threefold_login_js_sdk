FROM node:12 as frontend-builder

WORKDIR /app

COPY ./ .
RUN yarn && yarn build

WORKDIR example
RUN yarn && yarn build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=frontend-builder /app/example/dist /usr/share/nginx/html
COPY --from=frontend-builder /app/example/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
