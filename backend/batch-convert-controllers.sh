#!/bin/bash
# Batch convert remaining controllers to Sequelize
# Auto-conversion script

CONTROLLERS=(
  "deviceController.js"
  "subscriptionController.js"
  "paymentController.js"
  "alertController.js"
  "bandwidthController.js"
)

echo "🔄 Converting controllers to Sequelize..."
cd /home/basuki/nocman/backend/src/controllers

for controller in "${CONTROLLERS[@]}"; do
  echo "📝 Processing $controller..."
  
  # Backup first
  cp "$controller" "${controller}.backup"
  
  # 1. Fix imports - single model
  sed -i "s/^const \([A-Z][a-zA-Z]*\) = require('\.\.\/models\/\1');$/const { \1 } = require('..\/models');/g" "$controller"
  
  # 2. Fix imports - multiple models on separate lines  
  sed -i "s/^const \([A-Z][a-zA-Z]*\) = require('\.\.\/models\/\([A-Z][a-zA-Z]*\)');$/const { \1 } = require('..\/models');/g" "$controller"
  
  # 3. Add Op if not exists
  if ! grep -q "const { Op }" "$controller"; then
    if grep -q "const {" "$controller" | head -1; then
      sed -i "2i const { Op } = require('sequelize');" "$controller"
    fi
  fi
  
  # 4. findById → findByPk
  sed -i 's/\.findById(/\.findByPk(/g' "$controller"
  
  # 5. find() → findAll()
  sed -i 's/\.find()/.findAll()/g' "$controller"
  
  # 6. find({ → findAll({ where: {
  sed -i 's/\.find({/.findAll({ where: {/g' "$controller"
  
  # 7. findOne({ → findOne({ where: {
  sed -i 's/\.findOne({/.findOne({ where: {/g' "$controller"
  
  # 8. countDocuments → count
  sed -i 's/\.countDocuments()/.count()/g' "$controller"
  sed -i 's/\.countDocuments({/.count({ where: {/g' "$controller"
  
  # 9. $regex patterns → Op.like
  sed -i 's/{ $regex: \([a-zA-Z]*\), $options: .i. }/{ [Op.like]: `%${\1}%` }/g' "$controller"
  
  # 10. $or → Op.or
  sed -i 's/\$or:/[Op.or]:/g' "$controller"
  
  # 11. findByIdAndUpdate pattern (complex, needs manual review)
  # Mark for manual review
  if grep -q "findByIdAndUpdate" "$controller"; then
    echo "  ⚠️  Contains findByIdAndUpdate - needs manual review"
  fi
  
  # 12. findByIdAndDelete → destroy
  if grep -q "findByIdAndDelete" "$controller"; then
    echo "  ⚠️  Contains findByIdAndDelete - needs manual review"
  fi
  
  echo "  ✅ $controller processed"
done

echo ""
echo "✅ Batch conversion complete!"
echo "⚠️  Please review files marked with warnings"
echo "📦 Backups saved as *.backup"
