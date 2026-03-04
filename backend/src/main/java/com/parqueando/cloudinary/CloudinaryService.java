package com.parqueando.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.parqueando.common.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

  private final Cloudinary cloudinary;

  public CloudinaryService(Cloudinary cloudinary) {
    this.cloudinary = cloudinary;
  }

  // ✅ Mantener: lo usan otros servicios (solo devuelve URL)
  public String uploadImage(MultipartFile file, String folder) {
    if (file == null || file.isEmpty()) {
      throw new BadRequestException("Archivo vacío");
    }
    try {
      Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(),
          ObjectUtils.asMap(
              "folder", folder,
              "resource_type", "image"
          )
      );
      return String.valueOf(result.get("secure_url"));
    } catch (IOException e) {
      throw new BadRequestException("No se pudo subir imagen: " + e.getMessage());
    }
  }

  // ✅ Nuevo: devuelve URL + publicId (para vehiculos con muchas imágenes)
  public Map<String, String> uploadImageWithMetadata(MultipartFile file, String folder) {
    if (file == null || file.isEmpty()) {
      throw new BadRequestException("Archivo vacío");
    }
    try {
      Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(),
          ObjectUtils.asMap(
              "folder", folder,
              "resource_type", "image"
          )
      );
      return Map.of(
          "url", String.valueOf(result.get("secure_url")),
          "publicId", String.valueOf(result.get("public_id"))
      );
    } catch (IOException e) {
      throw new BadRequestException("No se pudo subir imagen: " + e.getMessage());
    }
  }

  // ✅ Nuevo: borrar en cloudinary por publicId
  public void deleteByPublicId(String publicId) {
    if (publicId == null || publicId.isBlank()) return;

    try {
      cloudinary.uploader().destroy(
          publicId,
          ObjectUtils.asMap("resource_type", "image")
      );
    } catch (IOException e) {
      throw new BadRequestException("No se pudo eliminar imagen: " + e.getMessage());
    }
  }
}