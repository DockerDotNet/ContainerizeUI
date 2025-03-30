#!/bin/sh

# Hardcoded environment variable prefix
APP_ENV_PREFIX="VITE_"

echo "Replacing environment variables with prefix $APP_ENV_PREFIX in built files inside /usr/share/nginx/html/assets/..."

for i in $(env | grep "^$APP_ENV_PREFIX"); do
    key=$(echo "$i" | cut -d '=' -f 1)
    value=$(echo "$i" | cut -d '=' -f 2-)

    # Remove surrounding quotes ONLY IF they exist
    trimmed_value=$(echo "$value" | sed -E 's/^"(.*)"$/\1/; s/^'"'"'(.*)'"'"'$/\1/')

    echo "Updating: $key to $trimmed_value"

    # Escape special characters for sed replacement
    escaped_value=$(printf '%s\n' "$trimmed_value" | sed -e 's/[\/&]/\\&/g')

    # Apply replacement in JavaScript files inside /usr/share/nginx/html/assets/
    find "/usr/share/nginx/html/assets/" -type f -name "*.js" -exec sed -i -E "s|(this\.${key}\s*=\s*)\"[^\"]*\"|\1\"${escaped_value}\"|g" {} \;
done

echo "Replacement complete. Starting Nginx..."
