Rails.application.routes.draw do
  root to: 'static_pages#home'

  get '/property/:id' => 'static_pages#property'
  get '/login' => 'static_pages#login'
  get '/user_page' => 'static_pages#user_page'
  get '/booking/:id/success' => 'static_pages#success'

  namespace :api do
    # properties (other)
    get '/properties/user' => 'properties#index_by_user'
    delete '/properties/images/:id' => 'properties#delete_images'
    # bookings (other)
    get '/bookings/guest' => 'bookings#get_guest_bookings'
    get '/bookings/host' => 'bookings#get_host_bookings'
    get '/bookings/:id' => 'bookings#successful_booking'
    get '/properties/:id/host' => 'bookings#get_property_bookings_host'
    get '/properties/:id/bookings' => 'bookings#get_property_bookings'
    # sessions (other)
    get '/authenticated' => 'sessions#authenticated'
    delete '/logout' => 'sessions#destroy'

    resources :users, only: [:create]
    resources :sessions, only: [:create]
    resources :properties, only: [:index, :show, :update, :create, :destroy]
    resources :bookings, only: [:create]
    resources :charges, only: [:create]

    # stripe webhook
    post '/charges/mark_complete' => 'charges#mark_complete'

  end

end
