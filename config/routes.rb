Rails.application.routes.draw do
  root to: 'static_pages#home'

  get '/property/:id' => 'static_pages#property'
  get '/login' => 'static_pages#login'
  get '/user_page' => 'static_pages#user_page'

  namespace :api do
    # properties (other)
    get '/properties/user' => 'properties#index_by_user'
    # bookings (other)
    get '/bookings/user' => 'bookings#get_user_bookings'
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
