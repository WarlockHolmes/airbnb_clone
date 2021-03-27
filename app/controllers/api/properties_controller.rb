module Api
  class PropertiesController < ApplicationController
    def index
      @properties = Property.order(created_at: :desc).page(params[:page]).per(6)
      return render json: { error: 'not_found' }, status: :not_found if !@properties

      render 'api/properties/index', status: :ok
    end

    def show
      @property = Property.find_by(id: params[:id])
      return render json: { error: 'not_found' }, status: :not_found if !@property

      render 'api/properties/show', status: :ok
    end

    def index_by_user
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)
      user = session.user

      if user
        @properties = user.properties.order(created_at: :desc).page(params[:page]).per(6)
        return render json: { error: 'not_found' }, status: :not_found if !@properties

        render 'api/properties/index', status: :ok
      end
    end

    def create
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)
      user = session.user
      @property = user.properties.new(property_params)

      if @property.save
        render 'api/properties/show', status: :ok
      end
    end

    def update
      token = cookies.signed[:airbnb_session_token]
      session = Session.find_by(token: token)
      user = session.user
      @property = user.properties.find_by(id: params[:id])

      return render json: { error: 'not_found' }, status: :not_found if not @property
      return render json: { error: 'bad_request' }, status: :bad_request if not @property.update(property_params)
      render 'api/properties/show', status: :ok
    end

    private

    def property_params
      params.require(:property).permit(:title, :city, :country, :price_per_night, :property_type, :beds, :baths, :image_url)
    end

  end
end
