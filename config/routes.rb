Rails.application.routes.draw do
  root to: 'static_pages#home'

  get '/property/:id' => 'static_pages#property'
  get '/login' => 'static_pages#login'
  get '/user_page' => 'static_pages#user_page'

  namespace :api do
    # Add routes below this line
    get '/properties/user' => 'properties#index_by_user'

    resources :users, only: [:create]
    resources :sessions, only: [:create]
    resources :properties, only: [:index, :show, :update, :create, :destroy]
    resources :bookings, only: [:create]
    resources :charges, only: [:create]
    # bookings (by property)
    get '/properties/:id/bookings' => 'bookings#get_property_bookings'
    # sessions (other)
    get '/authenticated' => 'sessions#authenticated'
    delete '/logout' => 'sessions#destroy'
    # stripe webhook
    post '/charges/mark_complete' => 'charges#mark_complete'

  end

end
