FROM node:10.16.3 as builder

WORKDIR /app
ADD package.json ./
RUN npm install
ADD ./ ./
RUN npm run build

FROM openresty/openresty:1.15.8.1-2-bionic
COPY --from=builder /app/dist/gongdan /usr/local/openresty/nginx/html