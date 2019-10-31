FROM nginx:alpine
COPY src /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/other.conf /etc/nginx/conf.d/other.conf