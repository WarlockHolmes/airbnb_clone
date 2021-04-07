json.total_pages @properties.total_pages
json.next_page @properties.next_page

json.properties do
  json.array! @properties do |property|
    json.id property.id
    json.title property.title
    json.description property.description
    json.city property.city
    json.country property.country
    json.property_type property.property_type
    json.price_per_night property.price_per_night
    json.max_guests property.max_guests
    json.bedrooms property.bedrooms
    json.beds property.beds
    json.baths property.baths
    json.image_url property.image_url
    json.image url_for(property.image) if property.image.attached?
    json.parking property.parking
    json.enhanced_clean property.enhanced_clean
    json.parties property.parties
    json.smoking property.smoking
    json.pets property.pets
    json.laundry property.laundry
    json.internet property.internet
    json.tv property.tv
    json.kitchen property.kitchen
    json.hair_dryer property.hair_dryer
    json.notes property.notes

    json.host do
      json.id property.user.id
      json.name property.user.username
    end

  end
end
