import { supabase } from '../config/supabase.js';
import { imageVerifier } from '../utils/imageVerifier.js';

/* Copilot generated this */
export const reportController = {
  // Create a new report
  async create(req, res) {
    try {
      const { disaster_id } = req.params;
      const { content, image_url } = req.body;
      
      // Verify disaster exists and get its description for image verification
      const { data: disaster, error: disasterError } = await supabase
        .from('disasters')
        .select('id, title, description')
        .eq('id', disaster_id)
        .single();

      if (disasterError || !disaster) {
        return res.status(404).json({ error: 'Disaster not found' });
      }

      // Verify image if provided
      let verification_status = 'pending';
      if (image_url) {
        try {
          const disasterDescription = `${disaster.title}. ${disaster.description}`;
          const verificationResult = await imageVerifier.verifyImage(image_url, disasterDescription);
          verification_status = verificationResult.status;
        } catch (err) {
          console.error('Image verification failed:', err);
          // Continue with report creation even if verification fails
        }
      }

      // Hardcoded user_id for now (will be replaced with auth)
      const user_id = 'netrunnerX';
      
      const { data, error } = await supabase
        .from('reports')
        .insert([
          {
            disaster_id,
            user_id,
            content,
            image_url,
            verification_status
          }
        ])
        .select();

      if (error) throw error;

      // Emit websocket event for real-time updates
      req.io.emit('report_updated', { action: 'create', report: data[0] });
      
      res.status(201).json(data[0]);
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Get all reports for a disaster
  async getAll(req, res) {
    try {
      const { disaster_id } = req.params;
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('disaster_id', disaster_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Get a single report
  async getOne(req, res) {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Update a report
  async update(req, res) {
    try {
      const { id } = req.params;
      const { content, image_url } = req.body;
      
      // First check if report exists and user owns it
      const { data: existing, error: fetchError } = await supabase
        .from('reports')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Hardcoded user check (will be replaced with auth)
      if (existing.user_id !== 'netrunnerX') {
        return res.status(403).json({ error: 'Not authorized to update this report' });
      }

      const { data, error } = await supabase
        .from('reports')
        .update({
          content,
          image_url,
          verification_status: image_url ? 'pending' : undefined // Reset verification if image changes
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      // Emit websocket event for real-time updates
      req.io.emit('report_updated', { action: 'update', report: data[0] });

      res.json(data[0]);
    } catch (error) {
      console.error('Error updating report:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Delete a report
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // First check if report exists and user owns it
      const { data: existing, error: fetchError } = await supabase
        .from('reports')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Hardcoded user check (will be replaced with auth)
      if (existing.user_id !== 'netrunnerX') {
        return res.status(403).json({ error: 'Not authorized to delete this report' });
      }

      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Emit websocket event for real-time updates
      req.io.emit('report_updated', { action: 'delete', reportId: id });

      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // Verify an image using Gemini API
  async verifyImage(req, res) {
    try {
      const { disaster_id } = req.params;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }

      // Verify disaster exists and get its description
      const { data: disaster, error: disasterError } = await supabase
        .from('disasters')
        .select('id, description, title')
        .eq('id', disaster_id)
        .single();

      if (disasterError || !disaster) {
        return res.status(404).json({ error: 'Disaster not found' });
      }

      // Create a comprehensive description for verification
      const disasterDescription = `${disaster.title}. ${disaster.description}`;

      // Check cache first
      const { data: cachedResult } = await supabase
        .from('cache')
        .select('value')
        .eq('key', `image_verification:${imageUrl}:${disaster_id}`)
        .single();

        // Todo - Uncomment after testing
      // if (cachedResult) {
      //   return res.json(cachedResult.value);
      // }

      // Verify image with disaster context
      const verificationResult = await imageVerifier.verifyImage(imageUrl, disasterDescription);

      // Cache the result
      await supabase
        .from('cache')
        .insert([
          {
            key: `image_verification:${imageUrl}:${disaster_id}`,
            value: verificationResult,
            expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour cache
          }
        ]);

      res.json(verificationResult);
    } catch (error) {
      console.error('Error verifying image:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
