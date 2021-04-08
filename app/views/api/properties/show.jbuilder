json.property do
  json.id @property.id
  json.title @property.title
  json.description @property.description
  json.city @property.city
  json.country @property.country
  json.property_type @property.property_type
  json.price_per_night @property.price_per_night
  json.max_guests @property.max_guests
  json.bedrooms @property.bedrooms
  json.beds @property.beds
  json.baths @property.baths
  json.parking @property.parking
  json.enhanced_clean @property.enhanced_clean
  json.parties @property.parties
  json.smoking @property.smoking
  json.pets @property.pets
  json.laundry @property.laundry
  json.internet @property.internet
  json.tv @property.tv
  json.kitchen @property.kitchen
  json.hair_dryer @property.hair_dryer
  json.notes @property.notes

  if @property.images.attached?
    json.images do
      json.array! @property.images do |image|
        json.image_url url_for(image)
      end
    end
  else
    json.image_url @property.image_url
  end

  json.host do
    json.id @property.user.id
    json.name @property.user.username
  end
end
