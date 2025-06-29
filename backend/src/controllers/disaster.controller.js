import { supabase } from '../config/supabase.js';
import { extractLocation } from '../utils/locationExtractor.js';
import { getCoordinates } from '../utils/geocoder.js';

/* Copilot generated this */
export const disasterController = {
  // Create a new disaster
  async create(req, res) {
    try {
      const { title, description, tags } = req.body;
      
      // Extract location from description using Gemini
      const location_name = await extractLocation(description);
      
      // Get coordinates from extracted location name
      const location = await getCoordinates(location_name);
      
      // Hardcoded owner_id for now (will be replaced with auth)
      const owner_id = 'netrunnerX';
      
      const { data, error } = await supabase
        .from('disasters')
        .insert([
          {
            title,
            location_name,
            location,
            description,
            tags,
            owner_id
          }
        ])
        .select();

      if (error) throw error;

      // Emit websocket event for real-time updates
      req.io.emit('disaster_updated', { action: 'create', disaster: data[0] });
      
      res.status(201).json(data[0]);
    } catch (error) {
      console.error('Error creating disaster:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Get all disasters with optional tag filter
  async getAll(req, res) {
    try {
      const { tag } = req.query;
      let query = supabase.from('disasters').select('*');
      
      if (tag) {
        query = query.contains('tags', [tag]);
      }

      const { data, error } = await query;
      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error fetching disasters:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Get a single disaster by ID
  async getOne(req, res) {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('disasters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Disaster not found' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error fetching disaster:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Update a disaster
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, tags } = req.body;
      
      // Extract location from description using Gemini
      const location_name = await extractLocation(description);
      
      // Get coordinates from extracted location name
      const location = await getCoordinates(location_name);

      // First check if disaster exists and user owns it
      const { data: existing, error: fetchError } = await supabase
        .from('disasters')
        .select('owner_id')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        return res.status(404).json({ error: 'Disaster not found' });
      }

      // Hardcoded owner check (will be replaced with auth)
      if (existing.owner_id !== 'netrunnerX') {
        return res.status(403).json({ error: 'Not authorized to update this disaster' });
      }

      const { data, error } = await supabase
        .from('disasters')
        .update({
          title,
          location_name,
          location,
          description,
          tags
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      // Emit websocket event for real-time updates
      req.io.emit('disaster_updated', { action: 'update', disaster: data[0] });

      res.json(data[0]);
    } catch (error) {
      console.error('Error updating disaster:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Delete a disaster
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // First check if disaster exists and user owns it
      const { data: existing, error: fetchError } = await supabase
        .from('disasters')
        .select('owner_id')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        return res.status(404).json({ error: 'Disaster not found' });
      }

      // Hardcoded owner check (will be replaced with auth)
      if (existing.owner_id !== 'netrunnerX') {
        return res.status(403).json({ error: 'Not authorized to delete this disaster' });
      }

      const { error } = await supabase
        .from('disasters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Emit websocket event for real-time updates
      req.io.emit('disaster_updated', { action: 'delete', disasterId: id });

      res.json({ message: 'Disaster deleted successfully' });
    } catch (error) {
      console.error('Error deleting disaster:', error);
      res.status(400).json({ error: error.message });
    }
  }
};
