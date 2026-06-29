const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const WASTE_CATEGORIES = {
  garbage_dump:      { label:'Garbage Dump',       icon:'🗑️' },
  overflowing_bin:   { label:'Overflowing Bin',    icon:'♻️' },
  missed_pickup:     { label:'Missed Pickup',      icon:'🚛' },
  construction_waste:{ label:'Construction Waste', icon:'🏗️' },
  plastic_waste:     { label:'Plastic Waste',      icon:'🛍️' },
  e_waste:           { label:'E-Waste',            icon:'💻' },
  medical_waste:     { label:'Medical Waste',      icon:'☣️' },
  hazardous_waste:   { label:'Hazardous Waste',    icon:'⚠️' },
  other:             { label:'Other',              icon:'📋' },
};

async function detectWasteFromImage(base64Image, mediaType='image/jpeg') {
  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type:  'image',
            source: { type:'base64', media_type:mediaType, data:base64Image },
          },
          {
            type: 'text',
            text: `Analyze this image and identify the type of waste or municipal issue shown.
Respond with ONLY a JSON object in this exact format, nothing else:
{
  "category": "one of: garbage_dump, overflowing_bin, missed_pickup, construction_waste, plastic_waste, e_waste, medical_waste, hazardous_waste, other",
  "severity": "one of: low, medium, high, critical",
  "confidence": "percentage 0-100",
  "description": "one sentence describing what you see",
  "is_emergency": true or false
}
If this is not a waste-related image, use category "other" with low severity.`,
          },
        ],
      }],
    });

    const text = response.content[0].text.trim();
    const clean = text.replace(/```json|```/g,'').trim();
    const result = JSON.parse(clean);

    return {
      success: true,
      category:     result.category     || 'other',
      severity:     result.severity     || 'medium',
      confidence:   result.confidence   || 50,
      description:  result.description  || '',
      is_emergency: result.is_emergency || false,
      label:        WASTE_CATEGORIES[result.category]?.label || 'Other',
      icon:         WASTE_CATEGORIES[result.category]?.icon  || '📋',
    };
  } catch(err) {
    console.error('AI detection failed:', err.message);
    return { success:false, category:'other', severity:'medium', confidence:0, description:'', is_emergency:false };
  }
}

module.exports = { detectWasteFromImage, WASTE_CATEGORIES };
