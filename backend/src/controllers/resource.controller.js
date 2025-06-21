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
      const { 
        location_name, // Optional: location name to search around
        latitude, // Optional: latitude for direct coordinate search
        longitude, // Optional: longitude for direct coordinate search
        distance = 10000, // Default: 10km
        type, // Optional: filter by resource type
        limit = 50, // Default: 50 results
        disaster_id // Optional: filter by disaster
      } = req.query;

      // We need either coordinates or a location name
      if (!latitude || !longitude) {
        if (!location_name) {
          return res.status(400).json({ 
            error: 'Either coordinates (latitude & longitude) or a location name is required' 
          });
        }
      }

      let searchPoint;
      let searchLocationName;

      // Determine search point based on provided parameters
      if (latitude && longitude) {
        // Use provided coordinates
        searchPoint = `SRID=4326;POINT(${longitude} ${latitude})`;
        searchLocationName = `${latitude},${longitude}`;
      } else if (location_name) {
        // If location_name provided, get its coordinates
        try {
          searchPoint = await getCoordinates(location_name);
          searchLocationName = location_name;
        } catch (err) {
          return res.status(400).json({ error: 'Could not geocode provided location' });
        }
      } else {
        return res.status(400).json({ 
          error: 'Either coordinates (latitude & longitude) or a location name is required' 
        });
      }

      let query = supabase.rpc('find_nearby_resources', { 
        // disaster_point: `SRID=4326;POINT(${searchPoint.coordinates[0]} ${searchPoint.coordinates[1]})`,
        disaster_point: searchPoint,
        distance_meters: distance
      });

      // Add type filter if provided
      if (type) {
        query = query.eq('type', type);
      }

      // Add disaster filter if provided
      if (disaster_id) {
        query = query.eq('disaster_id', disaster_id);
      }

      // Get results ordered by distance
      const { data, error, count } = await query
        .order('distance')
        .limit(limit);

      if (error) throw error;

      // Enhance response with metadata
      const response = {
        data,
        metadata: {
          total: count,
          search_location: searchLocationName,
          distance_km: distance / 1000,
          type_filter: type || 'all'
        }
      };

      res.json(response);
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
