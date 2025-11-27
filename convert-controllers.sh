#!/bin/bash
# Script to convert Mongoose controllers to Sequelize
# Usage: ./convert-controllers.sh

CONTROLLERS_DIR="/home/basuki/nocman/backend/src/controllers"

echo "🔄 Converting controllers from Mongoose to Sequelize..."

for file in "$CONTROLLERS_DIR"/*.js; do
    filename=$(basename "$file")
    
    # Skip already converted files
    if [[ "$filename" == "authController.js" ]] || [[ "$filename" == "userController.js" ]]; then
        echo "✅ Skipping $filename (already converted)"
        continue
    fi
    
    echo "📝 Processing $filename..."
    
    # Convert require statements
    sed -i "s/const \([A-Z][a-zA-Z]*\) = require('\.\.\/models\/\1');/const { \1 } = require('..\/models');/g" "$file"
    
    # Convert findById to findByPk
    sed -i 's/\.findById(/\.findByPk(/g' "$file"
    
    # Convert find() to findAll()
    sed -i 's/\.find()/.findAll()/g' "$file"
    
    # Convert find({ to findAll({ where: {
    sed -i 's/\.find({/.findAll({ where: {/g' "$file"
    
    # Convert findOne({ to findOne({ where: {
    sed -i 's/\.findOne({/.findOne({ where: {/g' "$file"
    
    # Convert .sort to order
    # This is more complex and needs manual review
    
    # Convert countDocuments to count
    sed -i 's/\.countDocuments()/\.count()/g' "$file"
    sed -i 's/\.countDocuments({/.count({ where: {/g' "$file"
    
    # Convert findByIdAndUpdate to update + findByPk
    # This needs manual handling
    
    # Convert findByIdAndDelete to destroy
    # This needs manual handling
    
    echo "  ⚠️  Please manually review $filename for:"
    echo "      - .sort() -> order: []"
    echo "      - .select() -> attributes: {}"
    echo "      - .populate() -> include: []"
    echo "      - findByIdAndUpdate/Delete patterns"
done

echo ""
echo "✅ Batch conversion complete!"
echo "⚠️  Manual review required for complex queries"
