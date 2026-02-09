FROM nginx:alpine

# Copy the HTML file and React component
COPY index.html /usr/share/nginx/html/
COPY music-request-app.jsx /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
