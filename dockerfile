FROM nginx:alpine

# Klasördeki TÜM dosyaları Nginx html klasörüne kopyala
COPY . /usr/share/nginx/html

EXPOSE 80
