package com.example.fashion_shop.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponse {

    private Long userId;
    private List<WishlistItemResponse> items;
    private Integer itemCount;
}
