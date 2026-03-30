/*
Justin Choi
Period 6
January 3, 2026
Section 9
*/
package choi.six.aws.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addRedirectViewController("/", "/homepage.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/Pictures/**")
                .addResourceLocations("file:./Pictures/")
                .setCachePeriod(0);

        registry.addResourceHandler("/*.html", "/*.css", "/*.js")
                .addResourceLocations("file:./Frontend/")
                .setCachePeriod(0);

        registry.addResourceHandler("/data/**")
                .addResourceLocations("file:./Frontend/data/")
                .setCachePeriod(0);
    }
}
