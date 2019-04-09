Vue.config.devtools = true

var eventBus = new Vue()

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        },
        details: {
            type: Array,
            required: false
        }
    },
    template: `
        <div class="product">
            <div class="product-image">
                <img :src="image">
            </div>
            <div class="product-info">
                <h1>{{ title }}</h1>
                <p>{{ description }}</p>
                
                <p>Shipping: {{ shipping }}</p>
                
                <product-details :details="details"></product-details>

                <p>Available sizes:</p>
                <ul>
                    <li v-for="size in sizes">{{ size }}</li>
                </ul>

                <div v-for="(variant, index) in variants"
                     :key="variant.variantId"
                     class="color-box"
                     :style="{ backgroundColor: variant.variantColor }"
                     @mouseover="updateProduct(index)">
                </div>

                <p v-if="inventory > 10">In stock</p>
                <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out</p>
                <p v-else :class="{ outOfStock: inventory == 0 }">Out of stock</p>
                <p>{{ printOnSale }}</p>

                <button v-on:click="addToCart"
                        :disabled="inventory == 0"
                        :class="{ disabledButton: inventory == 0 }">Add to Cart</button>
                <button v-on:click="removeFromCart">Remove Item</button>
                <button v-on:click="resetCart">Reset Cart</button>

            </div>
            
            <product-tabs :reviews="reviews"></product-tabs>
            
            
    `,
    data: function() {
        return {
            brand: 'Vue Mastery',
            product: 'Boots',
            description: 'Black leather boots. Shiny, new and beautiful. They will protect your feet well.',
            selectedVariant: 0,
            onSale: false,
            variants: [
                {
                    variantId: 1,
                    variantColor: "black",
                    variantImage: "./assets/black_leather_boots.jpg",
                    variantQuantity: 11
                },
                {
                    variantId: 2,
                    variantColor: "brown",
                    variantImage: "./assets/brown_leather_boots.jpg",
                    variantQuantity: 11
                }
            ],
            sizes: [ 9, 10, 11 ],
            reviews: []
        }
    },
    methods: {
        addToCart: function() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        removeFromCart: function() {
          this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        },
        resetCart: function() {
            this.$emit('reset-cart')
        },
        updateProduct: function(index) {
            this.selectedVariant = index
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inventory() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        printOnSale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' are currently on Sale!'
            }
            return ''
        },
        shipping() {
            if (this.premium) {
                return "Free"
            }
            return 2.99
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }
})

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
        <div class="product-details"
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
        </div>
    `
})

Vue.component('product-review', {
    template: `
        <div class="product-review" xmlns="http://www.w3.org/1999/html">
            <h2>Review this Product</h2>
            <form class="review-form" @submit.prevent="onSubmit">
                <p v-if="errors.length">
                    <b>Please correct the following error(s):</b>
                    <ul>
                        <li v-for="error in errors">{{ error }}</li>
                    </ul>
                </p>
                <p>
                    <label for="name">Name:</label>
                    <input id="name" v-model="name" placeholder="name">
                </p>
                
                <p>
                    <label for="review">Review:</label>
                    <textarea id="review" v-model="review" style="resize: none;"></textarea>
                </p>
                
                <p>
                    <label for="rating">Rating:</label>
                    <select id="rating" v-model.number="rating">
                        <option>5</option>
                        <option>4</option>
                        <option>3</option>
                        <option>2</option>
                        <option>1</option>
                    </select>
                </p>
                
                <p>
                    <input type="submit" value="Submit">
                </p>
            </form>
        </div>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
            }
            else {
                if (!this.name && !this.errors.find(e => e === "Name required.")) this.errors.push("Name required.")
                if (!this.review && !this.errors.find(e => e === "Review required.")) this.errors.push("Review required.")
                if (!this.rating && !this.errors.find(e => e === "Rating required.")) this.errors.push("Rating required.")
            }
        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
        <div>
            <span class="tab"
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs" :key="index"
                @click="selectedTab = tab">
                {{ tab }}
            </span>
            <div v-show="selectedTab === 'Reviews'">
                <h2>Reviews</h2>
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul>
                    <li v-for="(review, index) in reviews" :key="index">
                    <p>{{ review.name }}</p>
                    <p>Rating: {{ review.rating }}</p>
                    <p>{{ review.review }}</p>
                    </li>
                </ul>
            </div>
            
            <product-review v-show="selectedTab === 'Make a Review'"></product-review>
        </div>
        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})

Vue.component('range-slider', {
    data() {
        return {
            range_slider_value: 45
        }
    },
    computed: {
        slider_value: function() {
            return this.range_slider_value
        }
    },
    template: `
        <div class="range-slider">
            <input type="range" min="0" max="100" v-model="range_slider_value">
            <span v-text="range_slider_value"></span>
        </div>
    `
})

var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        details: ["Black leather", "Wasserdicht", "Gender-neutral"],
        cart: []
    },
    methods: {
        updateCart: function(id) {
            this.cart.push(id)
        },
        removeFromCart: function(id) {
            this.cart.pop()
        },
        resetCart: function() {
            this.cart = []
        }
    }
})