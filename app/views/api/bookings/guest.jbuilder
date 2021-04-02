json.bookings do
  json.array! @bookings do |booking|
    json.id booking.id
    json.start_date booking.start_date
    json.end_date booking.end_date
    json.paid booking.charges.any? { |charge| charge.complete }

    json.property do
      json.id booking.property.id
      json.title booking.property.title
      json.description booking.property.description
      json.city booking.property.city
      json.country booking.property.country
      json.property_type booking.property.property_type
      json.price_per_night booking.property.price_per_night
      json.max_guests booking.property.max_guests
      json.bedrooms booking.property.bedrooms
      json.beds booking.property.beds
      json.baths booking.property.baths

      if booking.property.image.attached?
        json.image url_for(booking.property.image)
      else
        json.image_url booking.property.image_url
      end

      json.host booking.property.user.username

    end
  end
end
