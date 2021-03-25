Rails.application.routes.draw do
  root to: 'static_pages#home'

  get '/property/:id' => 'static_pages#property'
  get '/login' => 'static_pages#login'
  get '/user_page' => 'static_pages#user_page'

  namespace :api do
    # Add routes below this line
    resources :users, only: [:create]
    resources :sessions, only: [:create]
    resources :properties, only: [:index, :show]
    resources :bookings, only: [:create]
    resources :charges, only: [:create]

    get '/properties/:id/bookings' => 'bookings#get_property_bookings'
    get '/properties/user/:user' => 'properties#index_by_user'
    get '/authenticated' => 'sessions#authenticated'
    delete '/logout' => 'sessions#destroy'
    # stripe webhook
    post '/charges/mark_complete' => 'charges#mark_complete'

  end

end
