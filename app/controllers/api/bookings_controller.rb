module Api
  class BookingsController < ApplicationController
    def create
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)
      return render json: { error: 'user not logged in' }, status: :unauthorized if !session

      property = Property.find_by(id: params[:booking][:property_id])
      return render json: { error: 'cannot find property' }, status: :not_found if !property

      begin
        @booking = Booking.create({ user_id: session.user.id, property_id: property.id, start_date: params[:booking][:start_date], end_date: params[:booking][:end_date]})
        render 'api/bookings/create', status: :created
      rescue ArgumentError => e
        render json: { error: e.message }, status: :bad_request
      end
    end

    def successful_booking
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)
      user = session.user

      if user
        @booking = Booking.find_by(id: params[:id])
        return render json: { error: 'not_found' }, status: :not_found if !@booking

        render 'api/bookings/success', status: :ok
      end

    end

    def get_property_bookings
      property = Property.find_by(id: params[:id])
      return render json: { error: 'cannot find property' }, status: :not_found if !property

      @bookings = property.bookings.where("end_date > ? ", Date.today)
      render 'api/bookings/index'
    end

    def get_property_bookings_host
      property = Property.find_by(id: params[:id])
      return render json: { error: 'cannot find property' }, status: :not_found if !property

      @bookings = property.bookings.where("end_date > ? ", Date.today).order(start_date: :desc)
      render 'api/bookings/host'
    end

    def get_guest_bookings
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)
      user = session.user

      if user
        @bookings = user.bookings.order(start_date: :desc)
        return render json: { error: 'not_found' }, status: :not_found if !@bookings

        render 'api/bookings/guest', status: :ok
      end
    end

    def get_host_bookings
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)
      user = session.user


      if user
        properties = user.properties.select { |property| property.bookings.length > 0 }
        return render json: { error: 'not_found' }, status: :not_found if properties.length == 0

        bookings = properties.map { |property| property.bookings }
        @bookings = bookings.flatten

        render 'api/bookings/host', status: :ok
      end

    end

    private

    def booking_params
      params.require(:booking).permit(:property_id, :start_date, :end_date)
    end
  end
end
