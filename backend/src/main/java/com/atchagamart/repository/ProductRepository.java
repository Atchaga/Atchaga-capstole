package com.atchagamart.repository;

import com.atchagamart.entity.Product;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryIgnoreCase(String category, Sort sort);

    List<Product> findByNameContainingIgnoreCase(String name, Sort sort);

    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR LOWER(p.category) = LOWER(:category)) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Product> findFiltered(@Param("category") String category,
                               @Param("search") String search,
                               @Param("minPrice") Double minPrice,
                               @Param("maxPrice") Double maxPrice,
                               Sort sort);

    @Query("SELECT DISTINCT p.category FROM Product p ORDER BY p.category")
    List<String> findDistinctCategories();

    List<Product> findBySellerId(Long sellerId);

    List<Product> findByCategoryContainingIgnoreCase(String category, Sort sort);
}
