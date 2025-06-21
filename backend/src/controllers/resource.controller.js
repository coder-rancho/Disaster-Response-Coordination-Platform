/* Copilot generated this */
import { supabase } from '../config/supabase.js';
import { getCoordinates } from '../utils/geocoder.js';

export const resourceController = {
  // Create a new resource
  async create(req, res) {
    try {
      const { disaster_id } = req.params;
      const { name, location_name, type } = req.body;

      if (!location_name) {
        return res.status(400).json({ error: 'Location name is required' });
      }

      // Verify disaster exists
      const { data: disaster, error: disasterError } = await supabase
        .from('disasters')
        .select('id')
        .eq('id', disaster_id)
        .single();

      if (disasterError || !disaster) {
        return res.status(404).json({ error: 'Disaster not found' });
      }

      // Get coordinates from location name using our geocoder
      const location = await getCoordinates(location_name);

      // Create resource with PostGIS point
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          disaster_id,
          name,
          location_name,
          location,
          type
        }])
        .select();

      if (error) throw error;

      // Emit websocket event for real-time updates
      req.io.emit('resource_updated', { action: 'create', resource: data[0] });
      
      res.status(201).json(data[0]);
    } catch (error) {
      console.error('Error creating resource:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Get all resources for a disaster
  async getAll(req, res) {
    try {
      const { disaster_id } = req.params;
      
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('disaster_id', disaster_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Get nearby resources using PostGIS
  async getNearby(req, res) {
    try {
      const { disaster_id } = req.params;
      const { latitude, longitude, distance = 10000 } = req.query; // distance in meters

      // First verify the disaster exists and get its location if no coordinates provided
      const { data: disaster, error: disasterError } = await supabase
        .from('disasters')
        .select('location')
        .eq('id', disaster_id)
        .single();

      if (disasterError || !disaster) {
        return res.status(404).json({ error: 'Disaster not found' });
      }

      // Use provided coordinates or disaster's location
      const point = latitude && longitude 
        ? `SRID=4326;POINT(${longitude} ${latitude})`
        : disaster.location;

      // Use the find_nearby_resources function
      const { data, error } = await supabase
        .rpc('find_nearby_resources', {
          disaster_point: point,
          distance_meters: parseInt(distance)
        });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error fetching nearby resources:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Update a resource
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, location_name, type } = req.body;

      const updates = {
        name,
        type
      };

      // Only update location if new location_name is provided
      if (location_name) {
        const location = await getCoordinates(location_name);
        updates.location_name = location_name;
        updates.location = location;
      }

      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Emit websocket event for real-time updates
      req.io.emit('resource_updated', { action: 'update', resource: data[0] });

      res.json(data[0]);
    } catch (error) {
      console.error('Error updating resource:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Delete a resource
  async delete(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Emit websocket event for real-time updates
      req.io.emit('resource_updated', { action: 'delete', resourceId: id });

      res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
      console.error('Error deleting resource:', error);
      res.status(400).json({ error: error.message });
    }
  }
};
