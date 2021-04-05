class AddAmenitiesToProperties < ActiveRecord::Migration[5.2]
  def change
    add_column :properties, :parking, :integer
    add_column :properties, :enhanced_clean, :boolean
    add_column :properties, :parties, :boolean
    add_column :properties, :smoking, :boolean
    add_column :properties, :pets, :string
    add_column :properties, :laundry, :string
    add_column :properties, :internet, :string
    add_column :properties, :tv, :boolean
    add_column :properties, :kitchen, :string
    add_column :properties, :hair_dryer, :boolean
    add_column :properties, :notes, :string
  end
end
