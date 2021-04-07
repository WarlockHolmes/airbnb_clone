json.booking do
  json.start_date @booking.start_date
  json.end_date @booking.end_date
  json.paid @booking.charges.any? { |charge| charge.complete }

  json.property do
    json.title @booking.property.title
    json.description @booking.property.description
    json.city @booking.property.city
    json.country @booking.property.country
    json.property_type @booking.property.property_type
    json.price_per_night @booking.property.price_per_night
    json.max_guests @booking.property.max_guests
    json.bedrooms @booking.property.bedrooms
    json.beds @booking.property.beds
    json.baths @booking.property.baths
    json.parking @booking.property.parking
    json.enhanced_clean @booking.property.enhanced_clean
    json.laundry @booking.property.laundry
    json.internet @booking.property.internet
    json.tv @booking.property.tv
    json.kitchen @booking.property.kitchen
    json.hair_dryer @booking.property.hair_dryer
    json.parties @booking.property.parties
    json.smoking @booking.property.smoking
    json.pets @booking.property.pets
    json.notes @booking.property.notes

    if @booking.property.image.attached?
      json.image url_for(@booking.property.image)
    else
      json.image_url @booking.property.image_url
    end

    json.host do
      json.name @booking.property.user.username
      json.id @booking.property.user.id
    end
  end
end
